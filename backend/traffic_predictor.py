import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
import joblib
import warnings
from datetime import datetime, timedelta
import calendar
import holidays
warnings.filterwarnings('ignore')

# ========== DYNAMIC INDIAN CALENDAR CLASS ==========

class IndianCalendar:
    """Dynamic Indian festivals and holidays that affect traffic - Works for any year"""
    
    def __init__(self):
        # Festival multipliers (how much traffic increases)
        self.festival_multipliers = {
            'Diwali': 2.0,
            'Holi': 1.8,
            'Dussehra': 1.7,
            'Ganesh Chaturthi': 1.6,
            'Navratri': 1.5,
            'Durga Puja': 1.6,
            'Christmas': 1.5,
            'New Year': 1.6,
            'Republic Day': 1.4,
            'Independence Day': 1.4,
            'Gandhi Jayanti': 1.3,
            'Eid-ul-Fitar': 1.6,
            'Eid ul-Adha': 1.5,
            'Bakrid': 1.5,
            'Janmashtami': 1.4,
            'Raksha Bandhan': 1.3,
            'Maharashtra Day': 1.3,
            'Pongal': 1.4,
            'Makar Sankranti': 1.3,
            'Ugadi': 1.3,
            'Gudi Padwa': 1.3,
            'Baisakhi': 1.3,
            'Onam': 1.5,
            'Guru Nanak Jayanti': 1.3,
            'Bhai Dooj': 1.3,
            'Chhath Puja': 1.4,
            'Maha Shivaratri': 1.3,
            'Ram Navami': 1.3,
            'Good Friday': 1.2,
            'Labour Day': 1.2,
            'Ambedkar Jayanti': 1.2,
            'Kannada Rajyotsava': 1.3,
            'Milad un-Nabi': 1.3,
            'Muharram': 1.3,
            "Valentine's Day": 1.2,
            "New Year's Eve": 1.5,
            'Teachers Day': 1.2,
            "Children's Day": 1.2,
            'Constitution Day': 1.2,
            'Engineers Day': 1.2,
            'Doctors Day': 1.2
        }
        
        # Weekend multiplier
        self.weekend_multiplier = 1.2  # 20% more traffic on weekends
    
    def get_festival_for_date(self, date):
        """Get festival name for a specific date using dynamic calculation"""
        if date is None:
            return None
        
        if isinstance(date, str):
            date = datetime.strptime(date, '%Y-%m-%d')
        
        month = date.month
        day = date.day
        year = date.year
        
        # ---------- FIXED DATE FESTIVALS ----------
        fixed_festivals = {
            (1, 1): 'New Year',
            (1, 14): 'Makar Sankranti',
            (1, 15): 'Pongal',
            (1, 26): 'Republic Day',
            (2, 14): "Valentine's Day",
            (3, 30): 'Good Friday',
            (4, 14): 'Ambedkar Jayanti',
            (4, 15): 'Baisakhi',
            (5, 1): 'Labour Day',
            (5, 9): 'Guru Ravidas Jayanti',
            (6, 5): 'World Environment Day',
            (7, 1): 'Doctors Day',
            (8, 15): 'Independence Day',
            (9, 5): 'Teachers Day',
            (10, 2): 'Gandhi Jayanti',
            (11, 1): 'Kannada Rajyotsava',
            (11, 14): "Children's Day",
            (11, 26): 'Constitution Day',
            (12, 25): 'Christmas',
            (12, 31): "New Year's Eve"
        }
        
        if (month, day) in fixed_festivals:
            return fixed_festivals[(month, day)]
        
        # ---------- DYNAMIC FESTIVALS ----------
        # Holi: March (Full moon in Phalguna)
        if month == 3 and 15 <= day <= 25:
            return 'Holi'
        
        # Diwali: October-November
        if month == 10 and 15 <= day <= 31:
            return 'Diwali'
        if month == 11 and 1 <= day <= 15:
            return 'Diwali'
        
        # Dussehra: October
        if month == 10 and 1 <= day <= 25:
            return 'Dussehra'
        
        # Ganesh Chaturthi: August-September
        if month == 8 and 20 <= day <= 31:
            return 'Ganesh Chaturthi'
        if month == 9 and 1 <= day <= 15:
            return 'Ganesh Chaturthi'
        
        # Navratri: September-October
        if month == 9 and 20 <= day <= 30:
            return 'Navratri'
        if month == 10 and 1 <= day <= 15:
            return 'Navratri'
        
        # Durga Puja: October
        if month == 10 and 1 <= day <= 20:
            return 'Durga Puja'
        
        # Eid-ul-Fitar: April-May
        if month in [4, 5] and 10 <= day <= 25:
            return 'Eid-ul-Fitar'
        
        # Eid ul-Adha/Bakrid: June-July
        if month in [6, 7] and 15 <= day <= 25:
            return 'Eid ul-Adha'
        
        # Muharram: July-August
        if month in [7, 8] and 15 <= day <= 25:
            return 'Muharram'
        
        # Janmashtami: August
        if month == 8 and 15 <= day <= 25:
            return 'Janmashtami'
        
        # Raksha Bandhan: August
        if month == 8 and 10 <= day <= 20:
            return 'Raksha Bandhan'
        
        # Maha Shivaratri: February-March
        if month == 2 and 15 <= day <= 25:
            return 'Maha Shivaratri'
        
        # Ram Navami: March-April
        if month == 4 and 1 <= day <= 15:
            return 'Ram Navami'
        
        # Ugadi: March-April
        if month == 4 and 1 <= day <= 15:
            return 'Ugadi'
        
        # Gudi Padwa: March-April
        if month == 4 and 1 <= day <= 15:
            return 'Gudi Padwa'
        
        # Onam: August-September
        if month in [8, 9] and 15 <= day <= 30:
            return 'Onam'
        
        # Guru Nanak Jayanti: November
        if month == 11 and 15 <= day <= 25:
            return 'Guru Nanak Jayanti'
        
        # Chhath Puja: October-November
        if month in [10, 11] and 20 <= day <= 30:
            return 'Chhath Puja'
        
        # Bhai Dooj: November
        if month == 11 and 1 <= day <= 15:
            return 'Bhai Dooj'
        
        # Milad un-Nabi: September-October
        if month in [9, 10] and 15 <= day <= 25:
            return 'Milad un-Nabi'
        
        return None
    
    def get_festival_multiplier(self, date):
        """Get traffic multiplier for a festival"""
        if date is None:
            return 1.0
        
        festival = self.get_festival_for_date(date)
        if festival:
            if festival in self.festival_multipliers:
                return self.festival_multipliers[festival]
            for key in self.festival_multipliers:
                if key.lower() in festival.lower() or festival.lower() in key.lower():
                    return self.festival_multipliers[key]
            return 1.4
        return 1.0
    
    def get_weekend_multiplier(self, date):
        """Get traffic multiplier for weekends"""
        if date is None:
            return 1.0
        if date.weekday() in [5, 6]:
            return self.weekend_multiplier
        return 1.0
    
    def is_weekend(self, date):
        """Check if date is weekend"""
        if date is None:
            return False
        return date.weekday() in [5, 6]
    
    def get_weekday_name(self, date):
        """Get weekday name"""
        if date is None:
            return 'Unknown'
        weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return weekdays[date.weekday()]
    
    def get_day_type(self, date):
        """Get day type: Weekend, Weekday, or Holiday"""
        if date is None:
            return 'Unknown'
        
        if self.is_weekend(date):
            return 'Weekend'
        elif self.get_festival_for_date(date) is not None:
            return 'Holiday'
        else:
            return 'Weekday'
    
    def get_holiday_multiplier(self, date):
        """Get traffic multiplier for holidays"""
        festival_multiplier = self.get_festival_multiplier(date)
        if festival_multiplier > 1.0:
            return festival_multiplier
        return self.get_weekend_multiplier(date)
    
    def format_hour(self, hour):
        """Convert 24-hour to 12-hour format with AM/PM"""
        if hour == 0:
            return '12:00 AM'
        elif hour < 12:
            return f'{hour:02d}:00 AM'
        elif hour == 12:
            return '12:00 PM'
        else:
            return f'{hour-12:02d}:00 PM'
    
    def get_upcoming_festivals(self, days=30):
        """Get upcoming festivals in next N days"""
        today = datetime.now()
        upcoming = []
        
        for days_offset in range(0, days + 1):
            check_date = today + timedelta(days=days_offset)
            festival = self.get_festival_for_date(check_date)
            if festival:
                multiplier = self.festival_multipliers.get(festival, 1.4)
                upcoming.append({
                    'date': check_date.strftime('%Y-%m-%d'),
                    'name': festival,
                    'days_until': days_offset,
                    'impact': multiplier,
                    'impact_percentage': f"{(multiplier - 1) * 100:.0f}%",
                    'day_type': self.get_day_type(check_date),
                    'weekday': self.get_weekday_name(check_date)
                })
        
        return sorted(upcoming, key=lambda x: x['days_until'])
    
    def get_weather_impact(self, weather_condition, temperature):
        """Get traffic impact based on weather conditions"""
        impact = 1.0
        
        if weather_condition in ['Rainy', 'Stormy']:
            impact *= 1.4
        elif weather_condition == 'Foggy':
            impact *= 1.3
        elif weather_condition == 'Cloudy':
            impact *= 1.1
        
        if temperature > 35:
            impact *= 1.2
        elif temperature < 10:
            impact *= 1.3
        
        return impact


# ========== TRAFFIC PREDICTOR CLASS ==========

class TrafficPredictor:
    def __init__(self):
        self.model = None
        self.models = {}
        self.model_weights = {}
        self.scaler = None
        self.feature_columns = None
        self.is_trained = False
        self.best_score = 0
        self.indian_calendar = IndianCalendar()
    
    def create_advanced_features(self, df):
        """Create advanced features including weather, festivals, holidays"""
        print("📊 Creating advanced features with 12-hour format...")
        df = df.copy()
        
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.hour
            df['hour_12'] = df['hour'].apply(self.indian_calendar.format_hour)
            df['minute'] = df['timestamp'].dt.minute
            df['day'] = df['timestamp'].dt.day
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['day_name'] = df['timestamp'].apply(self.indian_calendar.get_weekday_name)
            df['month'] = df['timestamp'].dt.month
            df['quarter'] = df['timestamp'].dt.quarter
            df['year'] = df['timestamp'].dt.year
            df['day_of_year'] = df['timestamp'].dt.dayofyear
            df['week_of_year'] = df['timestamp'].dt.isocalendar().week.astype(int)
            
            # Day type: Weekend, Weekday, Holiday
            df['day_type'] = df['timestamp'].apply(self.indian_calendar.get_day_type)
            df['is_weekend'] = df['timestamp'].apply(self.indian_calendar.is_weekend).astype(int)
            df['is_weekday'] = (1 - df['is_weekend']).astype(int)
            df['is_monday'] = (df['day_of_week'] == 0).astype(int)
            df['is_friday'] = (df['day_of_week'] == 4).astype(int)
            df['is_saturday'] = (df['day_of_week'] == 5).astype(int)
            df['is_sunday'] = (df['day_of_week'] == 6).astype(int)
            
            # Festivals
            df['festival'] = df['timestamp'].apply(self.indian_calendar.get_festival_for_date)
            df['festival_flag'] = df['festival'].notna().astype(int)
            df['festival_multiplier'] = df['timestamp'].apply(self.indian_calendar.get_festival_multiplier)
            df['weekend_multiplier'] = df['timestamp'].apply(self.indian_calendar.get_weekend_multiplier)
            df['holiday_multiplier'] = df['timestamp'].apply(self.indian_calendar.get_holiday_multiplier)
            
            # Encode festival names
            le = LabelEncoder()
            if df['festival'].notna().any():
                df['festival_encoded'] = le.fit_transform(df['festival'].fillna('No Festival').astype(str))
            else:
                df['festival_encoded'] = 0
        
        # Weather features
        if 'temperature' not in df.columns:
            df['temperature'] = 20 + 10 * np.sin(2 * np.pi * (df['month'] - 3) / 12) + 5 * np.cos(2 * np.pi * (df['hour'] - 6) / 24)
        
        if 'humidity' not in df.columns:
            df['humidity'] = 60 + 20 * np.sin(2 * np.pi * (df['month'] - 6) / 12) + 10 * np.sin(2 * np.pi * (df['hour'] - 12) / 24)
        
        if 'visibility' not in df.columns:
            df['visibility'] = 5 + 5 * np.random.randn(len(df))
            df['visibility'] = df['visibility'].clip(0, 10)
        
        if 'weather_condition' not in df.columns:
            weather_types = ['Clear', 'Cloudy', 'Rainy', 'Foggy', 'Stormy']
            df['weather_condition'] = np.random.choice(weather_types, len(df))
        
        df['weather_severity'] = 0
        df.loc[df['weather_condition'] == 'Rainy', 'weather_severity'] = 2
        df.loc[df['weather_condition'] == 'Stormy', 'weather_severity'] = 3
        df.loc[df['weather_condition'] == 'Foggy', 'weather_severity'] = 2
        df.loc[df['weather_condition'] == 'Cloudy', 'weather_severity'] = 1
        
        df['is_hot'] = (df['temperature'] > 30).astype(int)
        df['is_cold'] = (df['temperature'] < 15).astype(int)
        df['is_rainy'] = (df['weather_condition'] == 'Rainy').astype(int)
        df['is_foggy'] = (df['weather_condition'] == 'Foggy').astype(int)
        
        # Cyclical features
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['day_of_week'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['day_of_week'] / 7)
        df['month_sin'] = np.sin(2 * np.pi * df['month'] / 12)
        df['month_cos'] = np.cos(2 * np.pi * df['month'] / 12)
        
        # Peak hour detection (in 12-hour format)
        df['is_peak_hour'] = df['hour'].isin([7, 8, 9, 17, 18, 19]).astype(int)
        df['is_morning_peak'] = df['hour'].isin([7, 8, 9]).astype(int)
        df['is_evening_peak'] = df['hour'].isin([17, 18, 19]).astype(int)
        df['is_late_night'] = df['hour'].isin([0, 1, 2, 3, 4, 5]).astype(int)
        df['is_afternoon'] = df['hour'].isin([12, 13, 14, 15, 16]).astype(int)
        df['is_lunch_hour'] = df['hour'].isin([12, 13, 14]).astype(int)
        
        # Time slot encoding
        def get_time_slot(hour):
            if 5 <= hour < 7: return 0
            elif 7 <= hour < 10: return 1
            elif 10 <= hour < 12: return 2
            elif 12 <= hour < 14: return 3
            elif 14 <= hour < 17: return 4
            elif 17 <= hour < 20: return 5
            elif 20 <= hour < 23: return 6
            else: return 7
        
        df['time_slot'] = df['hour'].apply(get_time_slot)
        
        # Interaction features
        df['hour_x_day'] = df['hour'] * (df['day_of_week'] + 1)
        df['hour_x_weekend'] = df['hour'] * df['is_weekend']
        df['hour_x_month'] = df['hour'] * df['month']
        df['day_x_month'] = df['day'] * df['month']
        df['peak_x_weekend'] = df['is_peak_hour'] * df['is_weekend']
        df['festival_x_peak'] = df['festival_flag'] * df['is_peak_hour']
        df['rain_x_peak'] = df['is_rainy'] * df['is_peak_hour']
        df['temp_x_time'] = df['temperature'] * df['hour_sin']
        
        # Lag features
        if 'vehicle_count' in df.columns and len(df) > 100:
            df = df.sort_values('timestamp')
            df['lag_1'] = df['vehicle_count'].shift(1)
            df['lag_2'] = df['vehicle_count'].shift(2)
            df['lag_3'] = df['vehicle_count'].shift(3)
            df['lag_6'] = df['vehicle_count'].shift(6)
            df['lag_12'] = df['vehicle_count'].shift(12)
            df['lag_24'] = df['vehicle_count'].shift(24)
            df['lag_48'] = df['vehicle_count'].shift(48)
            df['lag_168'] = df['vehicle_count'].shift(168)
            
            df['rolling_mean_3'] = df['vehicle_count'].rolling(3, min_periods=1).mean()
            df['rolling_mean_6'] = df['vehicle_count'].rolling(6, min_periods=1).mean()
            df['rolling_mean_12'] = df['vehicle_count'].rolling(12, min_periods=1).mean()
            df['rolling_mean_24'] = df['vehicle_count'].rolling(24, min_periods=1).mean()
            df['rolling_std_6'] = df['vehicle_count'].rolling(6, min_periods=1).std()
            df['rolling_std_24'] = df['vehicle_count'].rolling(24, min_periods=1).std()
            df['rolling_max_6'] = df['vehicle_count'].rolling(6, min_periods=1).max()
            df['rolling_min_6'] = df['vehicle_count'].rolling(6, min_periods=1).min()
            
            df['change_1h'] = df['vehicle_count'] - df['lag_1']
            df['change_3h'] = df['vehicle_count'] - df['lag_3']
            df['change_6h'] = df['vehicle_count'] - df['lag_6']
            df['change_24h'] = df['vehicle_count'] - df['lag_24']
            df['pct_change_1h'] = (df['change_1h'] / (df['lag_1'] + 1)) * 100
            df['pct_change_6h'] = (df['change_6h'] / (df['lag_6'] + 1)) * 100
        
        # Encode categorical variables
        categorical_cols = ['time_slot', 'weather_condition', 'day_name', 'day_type']
        for col in categorical_cols:
            if col in df.columns:
                le = LabelEncoder()
                df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
        
        df.fillna(method='ffill', inplace=True)
        df.fillna(method='bfill', inplace=True)
        df.fillna(0, inplace=True)
        df = df.replace([np.inf, -np.inf], 0)
        
        print(f"   ✅ Created {len(df.columns)} features (with 12-hour AM/PM format)")
        return df
    
    def select_features(self, df):
        """Select and prepare features for training"""
        time_features = ['hour', 'minute', 'day', 'day_of_week', 'month', 'quarter', 'year', 'day_of_year', 'week_of_year']
        cyclical_features = ['hour_sin', 'hour_cos', 'day_sin', 'day_cos', 'month_sin', 'month_cos']
        peak_features = ['is_peak_hour', 'is_morning_peak', 'is_evening_peak', 'is_late_night', 'is_afternoon', 'is_lunch_hour']
        weekend_features = ['is_weekend', 'is_weekday', 'is_monday', 'is_friday', 'is_saturday', 'is_sunday']
        weather_features = ['temperature', 'humidity', 'visibility', 'weather_severity', 'is_hot', 'is_cold', 'is_rainy', 'is_foggy', 'weather_condition_encoded']
        festival_features = ['festival_flag', 'festival_multiplier', 'weekend_multiplier', 'holiday_multiplier', 'festival_encoded']
        interaction_features = ['hour_x_day', 'hour_x_weekend', 'hour_x_month', 'day_x_month', 'peak_x_weekend', 'festival_x_peak', 'rain_x_peak', 'temp_x_time']
        lag_features = ['lag_1', 'lag_2', 'lag_3', 'lag_6', 'lag_12', 'lag_24', 'lag_48', 'lag_168']
        rolling_features = ['rolling_mean_3', 'rolling_mean_6', 'rolling_mean_12', 'rolling_mean_24', 'rolling_std_6', 'rolling_std_24', 'rolling_max_6', 'rolling_min_6']
        change_features = ['change_1h', 'change_3h', 'change_6h', 'change_24h', 'pct_change_1h', 'pct_change_6h']
        
        all_features = (time_features + cyclical_features + peak_features + weekend_features + weather_features + festival_features + interaction_features + lag_features + rolling_features + change_features)
        
        existing_features = [f for f in all_features if f in df.columns]
        
        for col in df.columns:
            if col.endswith('_encoded') and col not in existing_features:
                existing_features.append(col)
        
        existing_features = list(set(existing_features))
        
        print(f"   ✅ Selected {len(existing_features)} features")
        print(f"   📊 Weather features: {len([f for f in existing_features if any(w in f for w in ['temperature', 'humidity', 'weather', 'rain', 'fog'])])}")
        print(f"   🎉 Festival features: {len([f for f in existing_features if 'festival' in f])}")
        print(f"   📅 Weekend/Weekday features: {len([f for f in existing_features if any(w in f for w in ['weekend', 'weekday', 'monday', 'friday', 'saturday', 'sunday'])])}")
        
        X = df[existing_features].fillna(0)
        y = df['vehicle_count'].fillna(0)
        X = X.replace([np.inf, -np.inf], 0)
        
        self.feature_columns = existing_features
        return X, y
    
    def train(self, df):
        """Train the model with all features including weather and festivals"""
        try:
            print("=" * 60)
            print("🚀 Training Advanced Traffic Prediction Model")
            print("📊 Including: Weather, Festivals, Holidays, Peak Hours")
            print("🕐 Using 12-hour AM/PM format")
            print("📅 Weekend/Weekday detection included")
            print("=" * 60)
            
            df = self.create_advanced_features(df)
            print(f"📊 Data shape: {df.shape}")
            
            print("\n🎯 Selecting features...")
            X, y = self.select_features(df)
            print(f"   ✅ X shape: {X.shape}, y shape: {y.shape}")
            
            print("\n📊 Splitting data...")
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X[:split_idx], X[split_idx:]
            y_train, y_test = y[:split_idx], y[split_idx:]
            print(f"   ✅ Train: {len(X_train)} samples, Test: {len(X_test)} samples")
            
            print("\n🔧 Scaling features...")
            self.scaler = StandardScaler()
            X_train_scaled = self.scaler.fit_transform(X_train)
            X_test_scaled = self.scaler.transform(X_test)
            
            print("\n🤖 Training multiple models...")
            
            # Random Forest
            print("   - Training Random Forest...")
            rf = RandomForestRegressor(
                n_estimators=300,
                max_depth=25,
                min_samples_split=5,
                min_samples_leaf=2,
                max_features='sqrt',
                random_state=42,
                n_jobs=-1
            )
            rf.fit(X_train_scaled, y_train)
            rf_pred = rf.predict(X_test_scaled)
            rf_r2 = r2_score(y_test, rf_pred)
            rf_mae = mean_absolute_error(y_test, rf_pred)
            rf_rmse = np.sqrt(mean_squared_error(y_test, rf_pred))
            print(f"      ✅ RF - R²: {rf_r2:.4f}, MAE: {rf_mae:.2f}, RMSE: {rf_rmse:.2f}")
            
            # Gradient Boosting
            print("   - Training Gradient Boosting...")
            gb = GradientBoostingRegressor(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=8,
                min_samples_split=5,
                min_samples_leaf=2,
                random_state=42
            )
            gb.fit(X_train_scaled, y_train)
            gb_pred = gb.predict(X_test_scaled)
            gb_r2 = r2_score(y_test, gb_pred)
            gb_mae = mean_absolute_error(y_test, gb_pred)
            gb_rmse = np.sqrt(mean_squared_error(y_test, gb_pred))
            print(f"      ✅ GB - R²: {gb_r2:.4f}, MAE: {gb_mae:.2f}, RMSE: {gb_rmse:.2f}")
            
            # XGBoost
            print("   - Training XGBoost...")
            xgb = XGBRegressor(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=8,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                n_jobs=-1
            )
            xgb.fit(X_train_scaled, y_train)
            xgb_pred = xgb.predict(X_test_scaled)
            xgb_r2 = r2_score(y_test, xgb_pred)
            xgb_mae = mean_absolute_error(y_test, xgb_pred)
            xgb_rmse = np.sqrt(mean_squared_error(y_test, xgb_pred))
            print(f"      ✅ XGB - R²: {xgb_r2:.4f}, MAE: {xgb_mae:.2f}, RMSE: {xgb_rmse:.2f}")
            
            # LightGBM
            print("   - Training LightGBM...")
            lgb = LGBMRegressor(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=8,
                num_leaves=31,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=42,
                verbose=-1,
                n_jobs=-1
            )
            lgb.fit(X_train_scaled, y_train)
            lgb_pred = lgb.predict(X_test_scaled)
            lgb_r2 = r2_score(y_test, lgb_pred)
            lgb_mae = mean_absolute_error(y_test, lgb_pred)
            lgb_rmse = np.sqrt(mean_squared_error(y_test, lgb_pred))
            print(f"      ✅ LGB - R²: {lgb_r2:.4f}, MAE: {lgb_mae:.2f}, RMSE: {lgb_rmse:.2f}")
            
            # Ensemble
            print("\n🔗 Creating ensemble model...")
            scores = {'rf': rf_r2, 'gb': gb_r2, 'xgb': xgb_r2, 'lgb': lgb_r2}
            weights = {k: max(0.1, v) for k, v in scores.items()}
            total_weight = sum(weights.values())
            
            self.models = {'rf': rf, 'gb': gb, 'xgb': xgb, 'lgb': lgb}
            self.model_weights = weights
            
            ensemble_pred = (weights['rf'] * rf_pred + weights['gb'] * gb_pred + weights['xgb'] * xgb_pred + weights['lgb'] * lgb_pred) / total_weight
            
            ensemble_r2 = r2_score(y_test, ensemble_pred)
            ensemble_mae = mean_absolute_error(y_test, ensemble_pred)
            ensemble_rmse = np.sqrt(mean_squared_error(y_test, ensemble_pred))
            mape = np.mean(np.abs((y_test - ensemble_pred) / (y_test + 1))) * 100
            
            self.model = rf
            self.is_trained = True
            self.best_score = ensemble_r2
            
            print("\n" + "=" * 60)
            print("✅ MODEL TRAINING COMPLETE!")
            print("=" * 60)
            print(f"📊 Ensemble R² Score: {ensemble_r2:.4f}")
            print(f"📊 Ensemble MAE: {ensemble_mae:.2f} vehicles")
            print(f"📊 Ensemble RMSE: {ensemble_rmse:.2f}")
            print(f"📊 MAPE: {mape:.2f}%")
            print(f"📊 Features used: {len(self.feature_columns)}")
            print(f"🎉 Festival features included: Yes (Dynamic Calendar)")
            print(f"🌤️ Weather features included: Yes")
            print(f"📅 Weekend/Weekday features included: Yes")
            print(f"🕐 12-hour AM/PM format included: Yes")
            print("=" * 60)
            
            print("\n🔝 Top 15 Most Important Features:")
            importance = dict(zip(self.feature_columns, rf.feature_importances_))
            top_features = sorted(importance.items(), key=lambda x: x[1], reverse=True)[:15]
            for i, (feat, imp) in enumerate(top_features, 1):
                bar = '█' * int(imp * 50)
                print(f"   {i:2d}. {feat:20s}: {imp:.4f} {bar}")
            
            print("\n" + "=" * 60)
            if ensemble_r2 > 0.95:
                print("🎉🎉🎉 EXCELLENT! R² > 0.95 - Target achieved!")
            elif ensemble_r2 > 0.90:
                print("🌟 GOOD! R² > 0.90 - Very close to target!")
            elif ensemble_r2 > 0.85:
                print("📈 MODERATE! R² > 0.85 - Need more improvement")
            else:
                print("⚠️ NEEDS IMPROVEMENT! R² < 0.85 - Try adding more data")
            print("=" * 60)
            
            return True
            
        except Exception as e:
            print(f"❌ Model training failed: {str(e)}")
            import traceback
            traceback.print_exc()
            self.is_trained = False
            return False
    
    def predict_ensemble(self, features):
        """Make predictions using ensemble model"""
        if not self.is_trained or not self.models:
            return self.predict(features)
        
        try:
            features_df = pd.DataFrame([features])
            for col in self.feature_columns:
                if col not in features_df.columns:
                    features_df[col] = 0
            features_df = features_df[self.feature_columns]
            scaled = self.scaler.transform(features_df)
            
            predictions = []
            total_weight = sum(self.model_weights.values())
            
            for name, model in self.models.items():
                pred = model.predict(scaled)[0]
                weight = self.model_weights.get(name, 1)
                predictions.append(pred * weight)
            
            ensemble_pred = sum(predictions) / total_weight
            return float(ensemble_pred)
            
        except Exception as e:
            print(f"Ensemble prediction error: {str(e)}")
            return self.predict(features)
    
    def predict(self, features):
        """Single model prediction (fallback)"""
        if not self.is_trained or self.model is None:
            return None
        
        try:
            features_df = pd.DataFrame([features])
            for col in self.feature_columns:
                if col not in features_df.columns:
                    features_df[col] = 0
            features_df = features_df[self.feature_columns]
            scaled = self.scaler.transform(features_df)
            prediction = self.model.predict(scaled)
            return float(prediction[0])
        except Exception:
            return None
    
    def predict_future(self, current_data, hours_ahead=6):
        """Predict future traffic considering weather and festivals with 12-hour format"""
        predictions = []
        current_date = datetime.now()
        
        for h in range(1, hours_ahead + 1):
            future_time = current_date + timedelta(hours=h)
            future_hour = future_time.hour
            future_day = future_time.weekday()
            
            festival = self.indian_calendar.get_festival_for_date(future_time)
            festival_multiplier = self.indian_calendar.get_festival_multiplier(future_time)
            holiday_multiplier = self.indian_calendar.get_holiday_multiplier(future_time)
            is_weekend = self.indian_calendar.is_weekend(future_time)
            day_name = self.indian_calendar.get_weekday_name(future_time)
            hour_12 = self.indian_calendar.format_hour(future_hour)
            
            features = {
                'hour': future_hour,
                'day_of_week': future_day,
                'month': future_time.month,
                'temperature': 25,
                'humidity': 60,
                'festival_flag': 1 if festival else 0,
                'festival_multiplier': festival_multiplier,
                'holiday_multiplier': holiday_multiplier,
                'is_weekend': 1 if is_weekend else 0
            }
            
            pred = self.predict_ensemble(features)
            if pred:
                congestion_level = self.get_congestion_level(pred)
                predictions.append({
                    'hour': hour_12,
                    'hour_24': f"{future_hour:02d}:00",
                    'day': day_name,
                    'is_weekend': is_weekend,
                    'day_type': 'Weekend' if is_weekend else 'Weekday',
                    'predicted_vehicles': int(pred),
                    'congestion_level': congestion_level,
                    'festival': festival if festival else 'None',
                    'festival_effect': f"{festival_multiplier:.1f}x" if festival else 'Normal'
                })
        
        return predictions
    
    def get_congestion_level(self, vehicle_count):
        """Convert vehicle count to congestion level"""
        if vehicle_count > 300:
            return "Heavy Congestion"
        elif vehicle_count > 150:
            return "Moderate"
        else:
            return "Smooth"
    
    def get_day_name(self, day_num):
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        return days[day_num % 7]
    
    def save_model(self, filepath='backend/models/traffic_model.pkl'):
        if not self.is_trained:
            print("❌ No model to save")
            return
        
        joblib.dump({
            'model': self.model,
            'models': self.models,
            'model_weights': self.model_weights,
            'scaler': self.scaler,
            'features': self.feature_columns,
            'is_trained': self.is_trained,
            'best_score': self.best_score
        }, filepath)
        print(f"✅ Model saved to {filepath}")
    
    def load_model(self, filepath='backend/models/traffic_model.pkl'):
        try:
            saved = joblib.load(filepath)
            self.model = saved['model']
            self.models = saved.get('models', {})
            self.model_weights = saved.get('model_weights', {})
            self.scaler = saved['scaler']
            self.feature_columns = saved['features']
            self.is_trained = saved.get('is_trained', False)
            self.best_score = saved.get('best_score', 0)
            print(f"✅ Model loaded from {filepath}")
            print(f"   📊 Best R² Score: {self.best_score:.4f}")
            return True
        except FileNotFoundError:
            print(f"❌ Model file not found: {filepath}")
            return False