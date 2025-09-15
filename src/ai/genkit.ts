
import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {firebase} from '@genkit-ai/firebase';
import {runWith} from 'genkit/context';
import {getFirestore} from 'firebase-admin/firestore';

const GEMINI_API_KEY = Symbol('GEMINI_API_KEY');

export const ai = genkit({
  plugins: [
    firebase(),
    googleAI({
      apiVersion: 'v1beta',
      apiKey: async () => {
        const key = await runWith({[GEMINI_API_KEY]: true}, async () => {
          return getGeminiApiKey();
        });
        return key || process.env.GENKIT_GOOGLEAI_API_KEY;
      },
    }),
  ],
});

async function getGeminiApiKey(): Promise<string | undefined> {
  try {
    const db = getFirestore();
    const {auth} = genkit.getAuthContext();
    if (!auth) {
      return undefined;
    }
    const settings = await db
      .collection('users')
      .doc(auth.uid)
      .collection('settings')
      .doc('main')
      .get();
    return settings.data()?.geminiApiKey;
  } catch (err) {
    console.error(err);
    throw new GenkitError({
      status: 'UNAVAILABLE',
      message: `An error occured when trying to get user's Gemini API key: ${err}`,
    });
  }
}
