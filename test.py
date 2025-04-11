from flask import Flask, request, jsonify
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image
import requests
from io import BytesIO

app = Flask(__name__)

# Load model and tokenizer
model = VisionEncoderDecoderModel.from_pretrained("nlpconnect/vit-gpt2-image-captioning").to("cpu")
processor = ViTImageProcessor.from_pretrained("nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained("nlpconnect/vit-gpt2-image-captioning")

def predict(image_url):
    image = Image.open(BytesIO(requests.get(image_url).content)).convert("RGB")
    pixel_values = processor(images=[image], return_tensors="pt").pixel_values
    output = model.generate(pixel_values, max_length=16, num_beams=4)
    return tokenizer.decode(output[0], skip_special_tokens=True).strip()

@app.route('/caption', methods=['POST'])
def caption_image():
    data = request.json
    image_url = data.get('image_url')
    if not image_url:
        return jsonify({'error': 'Missing image_url'}), 400

    try:
        caption = predict(image_url)
        print(caption)
        return jsonify({'caption': caption})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5085)

