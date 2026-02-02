# Coffee Roast AI

A machine learning project that classifies the roast level of coffee beans using image recognition. This project consists of a Python/FastAPI backend for serving the model and a React/Vite frontend for a user-friendly interface.

## Project Structure

- **`coffee_bean_roast.ipynb`**: Jupyter notebook used for training the TensorFlow/Keras model.
- **`coffee_roast_model.keras`**: The trained model file.
- **`serve.py`**: FastAPI application serving the model.
- **`coffee-roast-web/`**: Directory containing the React frontend application.
- **`requirements.txt`**: Python dependencies for the backend.
- **`coffee_beans.csv`**: Dataset index file (images are stored in `train/` and `test/` directories).

## Prerequisites

- [Python 3.8+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/) and `npm`

## Backend Setup

1.  **Create a Virtual Environment**
    Create and activate a virtual environment to isolate dependencies:

    ```bash
    python3 -m venv venv
    source venv/bin/activate
    # On Windows use: venv\Scripts\activate
    ```

2.  **Install Dependencies**
    Install the required packages:

    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the Server**
    Start the FastAPI server using `fastapi dev` (or `uvicorn` directly if preferred):

    ```bash
    fastapi dev serve.py
    ```
    
    The API will be available at `http://127.0.0.1:8000`. You can access the automatic documentation at `http://127.0.0.1:8000/docs`.

## Frontend Setup

1.  **Navigate to the Frontend Directory**

    ```bash
    cd coffee-roast-web
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    ```

3.  **Run the Development Server**

    ```bash
    npm run dev
    ```

    The web application will effectively run at the URL provided in the terminal (usually `http://localhost:5173`).

## Dataset

The dataset used for training the model is available in the `coffee_beans.csv` file. The dataset is split into a training set and a test set, with the training set containing 80% of the data and the test set containing 20% of the data.

The dataset is available at [Kaggle](https://www.kaggle.com/datasets/gpiosenka/coffee-bean-dataset-resized-224-x-224).

## Model Training

The model was trained using the `coffee_bean_roast.ipynb` notebook. It uses a Convolutional Neural Network (CNN) built with TensorFlow/Keras to classify coffee beans into 4 categories:
- Dark
- Green
- Light
- Medium

To re-train or explore the model, open the notebook in Jupyter or VS Code:

```bash
jupyter notebook coffee_bean_roast.ipynb
```
