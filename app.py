from flask import Flask, render_template, request, jsonify
import cv2
import numpy as np
import joblib
import base64

app = Flask(__name__)

MODELS = {
    "KNN": joblib.load('models/knn_model.pkl'),
    "Logistic Regression": joblib.load('models/log_reg_model.pkl'),
    "SVM": joblib.load('models/svm_model.pkl'),
    "Decision Tree": joblib.load('models/dt_model.pkl'),
    "Random Forest": joblib.load('models/rf_model.pkl'),
    "XGBoost": joblib.load('models/xgb_model.pkl')
}

def preprocess_image(img_data):
    img_bytes = base64.b64decode(img_data.split(',')[1])
    img = cv2.imdecode(np.frombuffer(img_bytes, np.uint8), cv2.IMREAD_GRAYSCALE)
    img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    img = cv2.flip(img, 1)
    img = cv2.resize(img, (28, 28))
    img = np.pad(img, ((10,10), (10,10)), 'constant', constant_values=0)
    img = cv2.resize(img, (28, 28)) / 255.0
    return img.flatten()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    img_data = data['image']
    selected_model = data.get('model', 'All')
    
    processed_img = preprocess_image(img_data)
    predictions = {}

    try:
        if selected_model == 'All':
            for model_name, model in MODELS.items():
                pred = model.predict([processed_img])[0]
                confidence = 100.0
                if hasattr(model, 'predict_proba'):
                    proba = model.predict_proba([processed_img])[0]
                    confidence = np.max(proba) * 100
                predictions[model_name] = f"{pred} ({confidence:.1f}%)"
        else:
            model = MODELS.get(selected_model)
            if not model:
                return jsonify({"error": "Invalid model selected"}), 400
            pred = model.predict([processed_img])[0]
            confidence = 100.0
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba([processed_img])[0]
                confidence = np.max(proba) * 100
            predictions[selected_model] = f"{pred} ({confidence:.1f}%)"

        return jsonify(predictions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)