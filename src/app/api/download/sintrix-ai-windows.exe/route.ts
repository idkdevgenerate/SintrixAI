import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { WIZARD_CONFIG } from '../../../../lib/wizard-config';
import { DEFAULT_SETUP_CONFIG, estimateSetupTime } from '../../../../lib/setup-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeSetup = searchParams.get('includeSetup') === 'true';
    
    // Path to your executable file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'downloads', 'SintrixAI-Setup.exe');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Executable file not found' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/x-msdownload');
    headers.set('Content-Disposition', 'attachment; filename=SintrixAI-Setup.exe');
    headers.set('Content-Length', fileBuffer.length.toString());

    if (includeSetup) {
      // Add setup information in custom headers
      headers.set('X-SintrixAI-Config', JSON.stringify({
        defaultConfig: DEFAULT_SETUP_CONFIG,
        wizardSteps: WIZARD_CONFIG.SETUP_STEPS,
        pretrainedModels: WIZARD_CONFIG.PRETRAINED_MODELS,
        apiTemplates: WIZARD_CONFIG.API_TEMPLATES,
        hostingOptions: WIZARD_CONFIG.HOSTING_OPTIONS,
        estimatedSetupTime: estimateSetupTime(DEFAULT_SETUP_CONFIG)
      }));
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to process download' },
      { status: 500 }
    );
  }
}
