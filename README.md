To run:
1. Put all *pkl files into models folder(create it first) of the root structure.
2. Put emnist-digits-train and test csv into main root folder.
3. Run python -m venv venv
4. Run source venv/bin/activate 
5. Run pip install opencv-python flask joblib numpy seaborn matplotlib pandas scikit-learn xgboost
6. Run pip freeze > requirements.txt (create it first in root folder)
7. Run python app.py, go to http://127.0.0.1:5000/

Things to be done:
1. styling of the page
2. deployement
3. press n to clear whiteborard
4. add thapar logo in static folder png
5. Wrapped all JavaScript code in a DOMContentLoaded event listener to ensure elements exist before accessing them.
6. Need model selector dropdown functioalitty
7. responsive pg
8. TBD