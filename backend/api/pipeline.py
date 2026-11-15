import pandas as pd
import numpy as np

class StudentAtRiskPipeline:
    """
    Unified preprocessing and inference pipeline wrapper for production deployment.
    """
    def __init__(self, model, scaler, feature_columns, training_categorical_defaults):
        self.model = model
        self.scaler = scaler
        self.feature_columns = feature_columns
        self.training_categorical_defaults = training_categorical_defaults

    def preprocess(self, raw_data_df: pd.DataFrame):
        df_input = raw_data_df.copy()
        for col, default in self.training_categorical_defaults.items():
            if col not in df_input.columns:
                df_input[col] = default
        df_encoded = pd.get_dummies(df_input)
        df_aligned = df_encoded.reindex(columns=self.feature_columns, fill_value=0)
        return self.scaler.transform(df_aligned)

    def predict(self, raw_data_df: pd.DataFrame):
        return self.model.predict(self.preprocess(raw_data_df))

    def predict_proba(self, raw_data_df: pd.DataFrame):
        return self.model.predict_proba(self.preprocess(raw_data_df))
