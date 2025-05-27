import { NextResponse } from 'next/server';
import type { TrainingData } from '@/lib/types';
import { validateApiKeyMiddleware } from '../../../lib/api-key-manager';

let storedTrainingData: TrainingData[] = [];
let storedModel: any = null;

export async function GET(request: Request) {
  // Validate API key
  const validationError = await validateApiKeyMiddleware(request, 'train');
  if (validationError) return validationError;

  try {
    return NextResponse.json({ 
      data: storedTrainingData,
      modelAvailable: storedModel !== null 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.type === 'ADD_TRAINING_DATA') {
      const newData: TrainingData = {
        input: body.input,
        output: body.output
      };
      storedTrainingData.push(newData);
      return NextResponse.json({ message: 'Training data added', data: newData });
    }
    
    if (body.type === 'SAVE_MODEL') {
      storedModel = body.model;
      return NextResponse.json({ message: 'Model saved successfully' });
    }

    if (body.type === 'CLEAR_DATA') {
      storedTrainingData = [];
      return NextResponse.json({ message: 'Training data cleared' });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
