const fs = require('fs');

async function transcribe() {
  const FormData = require('form-data');
  const fetch = require('node-fetch');

  // Load env
  require('dotenv').config();

  const formData = new FormData();
  formData.append('file', fs.createReadStream('./assets/voice-1762370065630.mp3'), {
    filename: 'audio.mp3',
    contentType: 'audio/mpeg'
  });
  formData.append('model', 'whisper-1');

  const apiKey = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      ...formData.getHeaders()
    },
    body: formData
  });

  const result = await response.json();
  console.log(result.text || JSON.stringify(result, null, 2));
}

transcribe().catch(console.error);
