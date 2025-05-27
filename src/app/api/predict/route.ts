import { NextResponse } from 'next/server';
import * as brain from 'brain.js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input, modelState } = body;

    if (!input || !modelState) {
      return NextResponse.json({ error: 'Missing input or model state' }, { status: 400 });
    }

    // Recreate the neural network from saved state
    const net = new brain.NeuralNetwork();
    net.fromJSON(modelState);

    // Make prediction
    const prediction = net.run(input);

    return NextResponse.json({ prediction });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to make prediction' }, { status: 500 });
  }
}
