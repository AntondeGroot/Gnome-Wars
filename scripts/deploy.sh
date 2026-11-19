#!/bin/bash
set -e
# Builds gnomewars.war (client bundled in) and drops it into the shared Tomcat on the Pi, then
# installs Gnome Wars' own nginx route. Tomcat and nginx themselves are provisioned by GWT_GameRoom.
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

if [[ -n "$1" ]]; then
  TARGET="$1"
elif ssh -o ConnectTimeout=3 -o BatchMode=yes -o StrictHostKeyChecking=accept-new -o ConnectionAttempts=1 my-pi true 2>/dev/null; then
  TARGET=my-pi
else
  echo "⚠️  my-pi unreachable, falling back to my-pi-ext (Cloudflare Tunnel)..."
  TARGET=my-pi-ext
fi
SSH="ssh -i ~/.ssh/pi_deploy_key $TARGET"
SCP="scp -i ~/.ssh/pi_deploy_key"

WEBAPPS=/var/lib/tomcat10/webapps
TOMCAT_URL=http://127.0.0.1:8090
LOG_FILE=/var/log/tomcat10/gnomewars.log
ROUTES_DIR=/etc/nginx/app-routes
ROUTE_CONF=$ROUTES_DIR/gnomewars.conf
NGINX_SITE=/etc/nginx/sites-enabled/gameroom

echo "🔨 Building frontend and running all backend tests..."
mvn clean verify -P frontend --file server/pom.xml

if ! $SSH "test -d $WEBAPPS"; then
  echo "❌ No Tomcat on $TARGET. Run ./setup-tomcat.sh in the GameRoom project first."
  exit 1
fi

echo "⚙️  Ensuring application override config exists..."
# Tomcat's unit only lets the JVM write under /var/log/tomcat10, so the log lives there.
$SSH "
sudo mkdir -p /opt/gnomewars
if [ ! -f /opt/gnomewars/application-override.yaml ]; then
  sudo tee /opt/gnomewars/application-override.yaml > /dev/null << 'EOF'
# Activates the rotation caps packaged in application.properties.
logging:
  file:
    name: $LOG_FILE
EOF
fi"

echo "📦 Uploading..."
$SCP server/target/gnomewars.war "$TARGET:/home/ubuntu/gnomewars.war"

echo "🚀 Deploying to Tomcat..."
# Copy under a name Tomcat ignores, then rename: a same-filesystem mv is atomic, so Tomcat never
# picks up a half-written WAR. Its autodeployer notices the new file and redeploys the app.
$SSH "sudo install -o tomcat -g tomcat -m 644 /home/ubuntu/gnomewars.war $WEBAPPS/.gnomewars.war.tmp \
  && sudo mv $WEBAPPS/.gnomewars.war.tmp $WEBAPPS/gnomewars.war && rm /home/ubuntu/gnomewars.war"

# The exploded dir is recreated on redeploy, so 'newer than the WAR' rules out the old version
# still answering; then wait until Spring has started and serves the health probe.
$SSH "for i in \$(seq 1 90); do
  if [ $WEBAPPS/gnomewars -nt $WEBAPPS/gnomewars.war ] && curl -sf -o /dev/null $TOMCAT_URL/gnomewars/health; then exit 0; fi
  sleep 2
done
echo '❌ Gnome Wars did not come up in Tomcat. See $LOG_FILE and journalctl -u tomcat10.'
exit 1"

echo "🔀 Installing nginx route..."
# The route is a file of its own in app-routes/, included from GameRoom's site, so GameRoom's
# setup-pi.sh can't wipe it. A config nginx rejects puts the previous route back.
$SCP ops/nginx-route.conf "$TARGET:/home/ubuntu/gnomewars-route.conf"
$SSH "
set -e
if ! grep -q 'include $ROUTES_DIR/\*.conf;' $NGINX_SITE; then
  echo '❌ $NGINX_SITE does not include $ROUTES_DIR/*.conf. Run GWT_GameRoom/setup-pi.sh first.'
  exit 1
fi
sudo mkdir -p $ROUTES_DIR
[ -f $ROUTE_CONF ] && sudo cp $ROUTE_CONF $ROUTE_CONF.prev
sudo mv /home/ubuntu/gnomewars-route.conf $ROUTE_CONF
if ! sudo nginx -t; then
  echo '❌ nginx rejected the Gnome Wars route — restoring the previous one'
  if [ -f $ROUTE_CONF.prev ]; then sudo mv $ROUTE_CONF.prev $ROUTE_CONF; else sudo rm -f $ROUTE_CONF; fi
  exit 1
fi
sudo rm -f $ROUTE_CONF.prev
sudo systemctl reload nginx"

echo "✅ Done."
