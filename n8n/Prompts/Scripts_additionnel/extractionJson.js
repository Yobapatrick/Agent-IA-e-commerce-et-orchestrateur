const raw = $json.output;

// Extraire uniquement le JSON entre { }
const match = raw.match(/\{[\s\S]*\}/);

if (!match) {
  throw new Error("JSON introuvable dans la sortie du modèle");
}

const parsed = JSON.parse(match[0]);

return [
  {
    json: parsed
  }
];
