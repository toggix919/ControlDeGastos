#!/bin/bash
# Script para configurar Firebase en el proyecto ctrl-gastos-toggix
set -e

echo "=== 1. Verificando cuenta activa ==="
gcloud config set account isaias.atg@gmail.com 2>/dev/null
gcloud config set project ctrl-gastos-toggix 2>/dev/null
echo "Cuenta: $(gcloud config get account 2>/dev/null)"
echo "Proyecto: $(gcloud config get project 2>/dev/null)"

echo ""
echo "=== 2. Agregando Firebase al proyecto ==="
TOKEN=$(gcloud auth print-access-token 2>/dev/null)
RESPONSE=$(curl -s -X POST \
  "https://firebase.googleapis.com/v1beta1/projects/ctrl-gastos-toggix:addFirebase" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}')
echo "Respuesta: $RESPONSE"

echo ""
echo "=== 3. Esperando a que Firebase se configure (15s) ==="
sleep 15

echo ""
echo "=== 4. Creando app web ==="
WEB_RESPONSE=$(curl -s -X POST \
  "https://firebase.googleapis.com/v1beta1/projects/ctrl-gastos-toggix/webApps" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Control de Gastos Web"}')
echo "Respuesta App Web: $WEB_RESPONSE"

echo ""
echo "=== 5. Creando cuenta de servicio para GitHub Actions ==="
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deploy" \
  --project=ctrl-gastos-toggix 2>/dev/null || echo "La cuenta de servicio ya existe"

echo ""
echo "=== 6. Asignando roles de Firebase ==="
SA_EMAIL="github-actions@ctrl-gastos-toggix.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding ctrl-gastos-toggix \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/firebase.admin" \
  --quiet 2>/dev/null

gcloud projects add-iam-policy-binding ctrl-gastos-toggix \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/firebasehosting.admin" \
  --quiet 2>/dev/null

echo "Roles asignados correctamente"

echo ""
echo "=== 7. Generando clave JSON de servicio ==="
KEY_FILE="$HOME/sa-key-ctrl-gastos.json"
gcloud iam service-accounts keys create "$KEY_FILE" \
  --iam-account="$SA_EMAIL" \
  --project=ctrl-gastos-toggix 2>/dev/null

echo ""
echo "================================================================"
echo "✅ ¡LISTO! Clave de servicio generada en:"
echo "   $KEY_FILE"
echo ""
echo "📋 Próximo paso: Copia el contenido del archivo y pégalo como"
echo "   Secret en GitHub (FIREBASE_SERVICE_ACCOUNT)"
echo ""
echo "   cat $KEY_FILE | xclip -selection clipboard"
echo "================================================================"
