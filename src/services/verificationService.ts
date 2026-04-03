import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface VerificationInput {
  mediaType: 'video' | 'image' | 'audio';
  fileId: string;
  originalHash: string;
  currentHash: string;
  c2paStatus: 'valid' | 'missing' | 'invalid';
  ed25519Signature: 'valid' | 'missing' | 'invalid';
  blockchainTimestamp: {
    exists: boolean;
    network: string;
    timestamp: string;
  };
  aiDetectionSignals: {
    deepfakeProbability: number;
    faceSwapDetected: boolean;
    voiceCloneDetected: boolean;
  };
}

export interface VerificationOutput {
  trustScore: number;
  trustLabel: 'high' | 'medium' | 'low' | 'suspicious';
  summary: string;
  technicalFindings: string[];
  recommendedActions: string[];
}

const SYSTEM_INSTRUCTION = `Du bist die Verifikations-Engine von CreatorSeal. Du bekommst strukturierte Metadaten zu einem Medienobjekt (Video, Bild oder Audio), inkl. C2PA-Status, Ed25519-Signaturinformationen, Blockchain-Timestamp und KI-Detektionssignalen.

Deine Aufgaben:
1. Berechne einen Trust Score von 0 bis 100, wobei 100 für maximal vertrauenswürdig steht und 0 für sehr wahrscheinlich manipuliert.
2. Lege ein Trust Label fest (high, medium, low, suspicious).
3. Erstelle eine prägnante, nicht-technische Zusammenfassung für normale Nutzer.
4. Liste technische Befunde als Bulletpoints auf (C2PA, Signaturen, Hash-Chain, Timestamp, KI-Detection).
5. Schlage konkrete Next Steps vor (z.B. erneute Aufnahme, zusätzliche Verifikation, Meldung an Plattform, manuelle Prüfung).

Richtlinien:
- Sei streng, aber fair: fehlende Signaturen oder C2PA bedeuten nicht automatisch Betrug, senken aber den Score.
- Kombiniere die Signale: hohe Deepfake-Probability plus ungültige Signatur und fehlender Timestamp ist deutlich kritischer als nur ein einzelnes schwaches Signal.
- Antworte immer im JSON-Format exakt im folgenden Schema:
{
  "trustScore": number,
  "trustLabel": "high" | "medium" | "low" | "suspicious",
  "summary": "string",
  "technicalFindings": ["string", ...],
  "recommendedActions": ["string", ...]
}`;

export async function verifyContent(input: VerificationInput): Promise<VerificationOutput> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: JSON.stringify(input),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as VerificationOutput;
  } catch (error) {
    console.error("Verification Error:", error);
    throw error;
  }
}
