import os
import random
import string
import googlemaps
# import pymysql
from datetime import datetime as dt
from dotenv import load_dotenv
from flask import Flask, jsonify, request, url_for, redirect, render_template, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, time, timedelta
from flask_jwt_extended import create_access_token, jwt_required, JWTManager, get_jwt_identity
from flask_marshmallow import Marshmallow
from marshmallow import ValidationError
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature


# Load environment variables from .env file
load_dotenv()
# pymysql.install_as_MySQLdb()

# --- App Configuration ---
app = Flask(__name__)

# gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))
basedir = os.path.abspath(os.path.dirname(__file__))
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///' + os.path.join(basedir, 'app.db'))
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI')
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+mysqldb://akashjha:QueueMe54321@akashjha.mysql.pythonanywhere-services.com/akashjha$QueueMeDB'


app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY","YOUR_SECURE_FLASK_KEY")
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# --- Initializations ---
# --- CORS Configuration ---
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
if not cors_origins or cors_origins == ['']:
    cors_origins = ["http://localhost:5173", "https://akashjha.pythonanywhere.com"]

CORS(app, resources={r"/api/*": {
    "origins": cors_origins,
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": True
}})

@app.before_request
def handle_preflight():
    """Handle all preflight OPTIONS requests from browser."""
    if request.method == "OPTIONS":
        response = app.make_default_options_response()
        headers = response.headers
        headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        headers["Access-Control-Allow-Credentials"] = "true"
        return response

jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)
mail = Mail(app) # Initialize Flask-Mail
ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])

# --- Database Models  ---

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    shopkeeper_id = db.Column(db.Integer, db.ForeignKey('shopkeeper.id'))
    service_type = db.Column(db.String(50))
    notes = db.Column(db.String(255))
    status = db.Column(db.String(20), default='upcoming')
    notification_method = db.Column(db.String(20))

class Shopkeeper(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    shops = db.relationship('Shop', backref='owner', lazy=True, cascade="all, delete-orphan")
    bookings = db.relationship('Booking', backref='shopkeeper', lazy=True)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Shop(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    shop_name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(200), nullable=True)
    appointment_duration = db.Column(db.Integer, nullable=False, default=30)
    opening_time = db.Column(db.Time, nullable=False, default=time(9, 0)) # 9:00 AM
    closing_time = db.Column(db.Time, nullable=False, default=time(17, 0)) # 5:00 PM
    shopkeeper_id = db.Column(db.Integer, db.ForeignKey('shopkeeper.id'), nullable=False)
    slot_capacity = db.Column(db.Integer, nullable=False, default=1)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    appointments = db.relationship('Appointment', backref='shop', lazy=True, cascade="all, delete-orphan")

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    appointment_time = db.Column(db.DateTime, nullable=False, index=True)
    status = db.Column(db.String(20), nullable=False, default='confirmed')
    appointment_token = db.Column(db.String(10), unique=True, nullable=False)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)
class BlockedSlot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    reason = db.Column(db.String(200), nullable=True)
    shop_id = db.Column(db.Integer, db.ForeignKey('shop.id'), nullable=False)

class Customer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    appointments = db.relationship('Appointment', backref='customer', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# --- Schema Definitions ---

class ShopkeeperSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shopkeeper
        load_instance = True
        sqla_session = db.session
        exclude = ('password_hash',)
        load_only = ('password',)

class ShopSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Shop
        load_instance = True
        sqla_session = db.session
        include_fk = True

class CustomerSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Customer
        load_instance = True
        sqla_session = db.session
        exclude = ('password_hash',)
        load_only = ('password',)

class AppointmentSchema(ma.SQLAlchemyAutoSchema):
    customer = ma.Nested(CustomerSchema, exclude=('appointments',)) # Add this line
    class Meta:
        model = Appointment
        load_instance = True
        sqla_session = db.session
        include_fk = True
class BlockedSlotSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = BlockedSlot
        load_instance = True
        sqla_session = db.session
        include_fk = True


# Instantiate schemas
shopkeeper_schema = ShopkeeperSchema()
shop_schema = ShopSchema()
shops_schema = ShopSchema(many=True)
customer_schema = CustomerSchema()
customers_schema = CustomerSchema(many=True)
appointment_schema = AppointmentSchema()
appointments_schema = AppointmentSchema(many=True)
blocked_slot_schema = BlockedSlotSchema()
blocked_slots_schema = BlockedSlotSchema(many=True)

# --- Helper Functions ---
def generate_token():
    # Generate a simple token like 'A-1234'
    letter = random.choice(string.ascii_uppercase)
    digits = ''.join(random.choices(string.digits, k=4))
    return f"{letter}-{digits}"

@app.after_request
def add_security_headers(response):
    # Ensure the content type is explicitly set to UTF-8
    if 'Content-Type' in response.headers and 'application/json' in response.headers['Content-Type']:
        response.headers['Content-Type'] = 'application/json; charset=utf-8'

    # Add Cache-Control headers to prevent caching
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'  # For legacy HTTP/1.0 clients
    response.headers['Expires'] = '0'  # Proxies
    return response

@app.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin in cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# --- API Endpoints ---
@app.route('/favicon.ico')
def favicon():
    return send_from_directory('static', 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    return render_template('index.html')

# --- Shopkeeper Endpoints ---

@app.route('/api/shopkeepers/register', methods=['POST'])
def shopkeeper_register():
    #(get and validate data is the same)
    data = request.get_json()
    if not data or not data.get('full_name') or not data.get('email') or not data.get('password'):
        return jsonify({"error": "full_name, email, and password are required"}), 400

    if Shopkeeper.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email address already in use"}), 409

    # Create the new user but DON'T commit yet
    new_shopkeeper = Shopkeeper(
        full_name=data['full_name'],
        email=data['email']
    )
    new_shopkeeper.set_password(data['password'])
    db.session.add(new_shopkeeper)

    #VERIFICATION LOGIC FOR SHOPKEEPER REGESTRATION
    try:
        # Generate a timed token for email verification
        token = ts.dumps(new_shopkeeper.email, salt='email-confirm-salt')

        # This URL should point to your API's new verification endpoint
        confirm_url = url_for('confirm_email', token=token, _external=True)

        msg = Message(
            subject="Confirm Your Email Address",
            sender=app.config['MAIL_USERNAME'],
            recipients=[new_shopkeeper.email]
        )
        msg.body = f"Please click the following link to verify your email address: {confirm_url}"
        mail.send(msg)

        # Now commit the new user to the database
        db.session.commit()
    except Exception as e:
        db.session.rollback() # Rollback the user creation if email fails
        app.logger.error(f"Failed to send verification email: {e}")
        return jsonify({"error": "Could not send verification email."}), 500
    # -----------------------------------

    return jsonify({
        "message": "Registration successful! Please check your email to verify your account."
    }), 201

@app.route('/api/shopkeepers/confirm/<token>')
def confirm_email(token):
    try:
        # Verifing the token and extract the email
        email = ts.loads(token, salt='email-confirm-salt', max_age=86400) # 24-hour expiration
    except:
        # Handles SignatureExpired, BadTimeSignature, etc.
        # In a real app, you would redirect to a frontend page showing an error
        return '<h1>The confirmation link is invalid or has expired.</h1>', 400

    shopkeeper = Shopkeeper.query.filter_by(email=email).first_or_404()

    if shopkeeper.is_verified:
        # In a real app, redirect to a frontend page saying "already confirmed"
        return '<h1>Account already confirmed. Please login.</h1>', 200
    else:
        shopkeeper.is_verified = True
        db.session.commit()
        # In a real app, redirect to a frontend login page with a success message
        return '<h1>Your account has been successfully verified! You can now log in.</h1>', 200


#forgot_password function

@app.route('/api/shopkeepers/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    shopkeeper = Shopkeeper.query.filter_by(email=email).first()

    if shopkeeper:
        token = ts.dumps(shopkeeper.email, salt='password-reset-salt')

        # THE DYNAMIC LOGIC

        # Get the list of allowed origins from environment variables
        allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

        # Get the origin of the request
        origin = request.headers.get('Origin')

        # Determine the base URL for the reset link
        if origin in allowed_origins:
            base_url = origin
        else:
            # Fallback to a safe default if the origin is not allowed
            base_url = os.getenv('DEFAULT_FRONTEND_URL')

        reset_url = f"{base_url}/reset-password?token={token}"
        # ---------------------------------------------

        try:
            msg = Message(
                subject="Password Reset Request",
                sender=app.config['MAIL_USERNAME'],
                recipients=[email]
            )
            msg.body = f"Click the following link to reset your password: {reset_url}"
            mail.send(msg)
        except Exception as e:
            app.logger.error(f"Failed to send password reset email: {e}")

    return jsonify({"message": "If an account with that email exists, a password reset link has been sent."}), 200

# Reset Password for Shopkeepers
@app.route('/api/shopkeepers/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({"error": "Token and new password are required"}), 400

    try:
        # Verify the token and extract the email
        email = ts.loads(token, salt='password-reset-salt', max_age=3600) # 1 hour expiration
    except SignatureExpired:
        return jsonify({"error": "The password reset link has expired."}), 400
    except BadTimeSignature:
        return jsonify({"error": "Invalid password reset link."}), 400
    except Exception:
        return jsonify({"error": "An unknown error occurred."}), 500

    shopkeeper = Shopkeeper.query.filter_by(email=email).first()
    if not shopkeeper:
        return jsonify({"error": "Invalid user."}), 404

    shopkeeper.set_password(new_password)
    db.session.commit()

    return jsonify({"message": "Your password has been reset successfully."}), 200

# Shopkeeper Login Function
@app.route('/api/shopkeepers/login', methods=['POST'])
def shopkeeper_login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400

    email = data.get('email')
    password = data.get('password')

    shopkeeper = Shopkeeper.query.filter_by(email=email).first()

    if shopkeeper and not shopkeeper.is_verified:
        return jsonify({"error": "Your account has not been verified. Please check your email."}), 403

    if shopkeeper and shopkeeper.check_password(password):
        access_token = create_access_token(identity=str(shopkeeper.id))
        return jsonify(access_token=access_token)

    return jsonify({"error": "Invalid email or password"}), 401

#Create Shops
@app.route('/api/my-shops', methods=['POST'])
@jwt_required()
def create_shop():

    data = request.get_json()
    shopkeeper_id = get_jwt_identity()

    try:
        data['shopkeeper_id'] = shopkeeper_id
        new_shop = shop_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db.session.add(new_shop)
    db.session.commit()

    return jsonify({
        "message": "Shop created successfully",
        "shop": shop_schema.dump(new_shop)
    }), 201

@app.route('/api/my-shops', methods=['GET'])
@jwt_required()
def get_my_shops():
    shopkeeper_id = get_jwt_identity()

    shopkeeper = Shopkeeper.query.get(shopkeeper_id)
    if not shopkeeper:
        return jsonify({"error": "Shopkeeper not found"}), 404

    shops = shopkeeper.shops

    return jsonify(shops_schema.dump(shops))

@app.route('/api/my-shops/<int:shop_id>', methods=['PUT'])
@jwt_required()
def update_shop(shop_id):
    shopkeeper_id = get_jwt_identity()
    shop = Shop.query.get_or_404(shop_id)

    # Ownership Verification
    if str(shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to modify this shop"}), 403

    data = request.get_json()

    try:
        updated_shop = shop_schema.load(data, instance=shop, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db.session.commit()

    return jsonify({
        "message": "Shop updated successfully",
        "shop": shop_schema.dump(updated_shop)
    })


@app.route('/api/my-shops/<int:shop_id>/appointments', methods=['GET'])
@jwt_required()
def get_shop_appointments(shop_id):
    shopkeeper_id = get_jwt_identity()
    shop = Shop.query.get_or_404(shop_id)

    if str(shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to view these appointments"}), 403

    # Get page and per_page from query parameters
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    base_query = Appointment.query.filter_by(shop_id=shop_id)

    date_str = request.args.get('date')
    if date_str:
        try:
            requested_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            start_of_day = datetime.combine(requested_date, time.min)
            end_of_day = datetime.combine(requested_date, time.max)
            base_query = base_query.filter(Appointment.appointment_time.between(start_of_day, end_of_day))
        except ValueError:
            return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    # Use .paginate() here
    pagination = base_query.order_by(Appointment.appointment_time).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        'appointments': appointments_schema.dump(pagination.items),
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    })

@app.route('/api/my-shops/appointments/<int:appointment_id>', methods=['DELETE'])
@jwt_required()
def shopkeeper_cancel_appointment(appointment_id):
    shopkeeper_id = get_jwt_identity()
    appointment = Appointment.query.get_or_404(appointment_id)

    # Ownership Verification
    if str(appointment.shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to cancel this appointment"}), 403

    if appointment.status.startswith('cancelled'):
        return jsonify({"error": "This appointment has already been cancelled."}), 409

    # You can choose to either soft delete (change status) or hard delete
    # Option 1: Soft Delete (Recommended)
    appointment.status = 'cancelled_by_shop'

    # Option 2: Hard Delete
    # db.session.delete(appointment)

    db.session.commit()

    return jsonify({"message": f"Appointment {appointment_id} has been cancelled."})

@app.route('/api/my-shops/<int:shop_id>/analytics', methods=['GET'])
@jwt_required()
def get_shop_analytics(shop_id):
    shopkeeper_id = get_jwt_identity()
    shop = Shop.query.get_or_404(shop_id)

    # Ownership Verification
    if str(shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to view these analytics"}), 403

    # Define the time range for today
    today = datetime.utcnow().date()
    start_of_day = datetime.combine(today, time.min)
    end_of_day = datetime.combine(today, time.max)

    # Base query for today's appointments for the specific shop
    base_query = Appointment.query.filter(
        Appointment.shop_id == shop_id,
        Appointment.appointment_time >= start_of_day,
        Appointment.appointment_time <= end_of_day
    )

    # Calculate metrics
    total_appointments = base_query.count()
    completed_appointments = base_query.filter(Appointment.status == 'completed').count()
    cancelled_appointments = base_query.filter(Appointment.status.like('cancelled%')).count()
    upcoming_appointments = base_query.filter(
        Appointment.status == 'confirmed',
        Appointment.appointment_time > datetime.utcnow()
    ).count()

    # Assemble the response
    analytics_data = {
        "date": today.isoformat(),
        "total_appointments": total_appointments,
        "completed_appointments": completed_appointments,
        "cancelled_appointments": cancelled_appointments,
        "upcoming_appointments": upcoming_appointments
    }

    return jsonify(analytics_data)

@app.route('/api/my-shops/<int:shop_id>/blocked-slots', methods=['POST'])
@jwt_required()
def create_blocked_slot(shop_id):
    shopkeeper_id = get_jwt_identity()
    shop = Shop.query.get_or_404(shop_id)

    # Ownership Verification
    if str(shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to modify this shop"}), 403

    data = request.get_json()
    try:
        data['shop_id'] = shop_id
        new_blocked_slot = blocked_slot_schema.load(data)
    except ValidationError as err:
        return jsonify(err.messages), 400

    db.session.add(new_blocked_slot)
    db.session.commit()

    return jsonify({
        "message": "Time slot blocked successfully",
        "blocked_slot": blocked_slot_schema.dump(new_blocked_slot)
    }), 201


@app.route('/api/my-shops/appointments/<int:appointment_id>', methods=['PUT'])
@jwt_required()
def update_appointment_status(appointment_id):
    shopkeeper_id = get_jwt_identity()
    appointment = Appointment.query.get_or_404(appointment_id)

    # Ownership Verification
    if str(appointment.shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to modify this appointment"}), 403

    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    appointment.status = new_status
    db.session.commit()

    return jsonify(appointment_schema.dump(appointment))

@app.route('/api/my-shops/<int:shop_id>/blocked-slots', methods=['GET'])
@jwt_required()
def get_blocked_slots(shop_id):
    shopkeeper_id = get_jwt_identity()
    shop = Shop.query.get_or_404(shop_id)

    # Ownership Verification
    if str(shop.shopkeeper_id) != shopkeeper_id:
        return jsonify({"error": "Unauthorized to view this data"}), 403

    blocked_slots = BlockedSlot.query.filter_by(shop_id=shop_id).all()
    return jsonify(blocked_slots_schema.dump(blocked_slots))

# --- Customer Endpoints ---
# -----------------------------------------------------------------------------
@app.route('/api/customers/register', methods=['POST'])
def customer_register():
    data = request.get_json()
    if not data or not all(key in data for key in ['full_name', 'email', 'password']):
        return jsonify({"error": "full_name, email, and password are required"}), 400
    if Customer.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email address already in use"}), 409

    new_customer = Customer(
        full_name=data['full_name'],
        email=data['email'],
        phone=data.get('phone')
    )
    new_customer.set_password(data['password'])
    db.session.add(new_customer)

    # You can add email verification for customers here, just like for shopkeepers
    new_customer.is_verified = True # For simplicity, we'll auto-verify for now
    db.session.commit()

    return jsonify({"message": "Customer registered successfully."}), 201

@app.route('/api/customers/login', methods=['POST'])
def customer_login():
    data = request.get_json()
    customer = Customer.query.filter_by(email=data.get('email')).first()

    if customer and customer.check_password(data.get('password')):
        if not customer.is_verified:
            return jsonify({"error": "Account not verified. Please check your email."}), 403

        access_token = create_access_token(identity=str(customer.id))
        return jsonify(access_token=access_token)

    return jsonify({"error": "Invalid email or password"}), 401

# @app.route('/api/my-appointments', methods=['GET', 'OPTIONS'])
# @jwt_required()
# def get_my_appointments():
#     try:
#         customer_id = int(get_jwt_identity())
#         customer = Customer.query.get(customer_id)
#         if not customer:
#             return jsonify({"error": "Customer not found"}), 404

#         appointments = Appointment.query.filter_by(customer_id=customer_id).order_by(Appointment.appointment_time.desc()).all()
#         return jsonify(appointments_schema.dump(appointments)), 200
#     except Exception as e:
#         app.logger.error(f"Error in /api/my-appointments: {e}")
#         return jsonify({"error": "Failed to fetch appointments", "details": str(e)}), 500

@app.route('/api/shops/<int:shop_id>/distance', methods=['GET'])
def get_shop_distance(shop_id):
    shop = Shop.query.get_or_404(shop_id)
    if not shop.latitude or not shop.longitude:
        return jsonify({"error": "Shop location is not available."}), 404

    # Get the user's current location from query parameters
    user_lat = request.args.get('lat')
    user_lng = request.args.get('lng')

    if not user_lat or not user_lng:
        return jsonify({"error": "User location (lat, lng) is required."}), 400

    user_origin = (user_lat, user_lng)
    shop_destination = (shop.latitude, shop.longitude)

    try:
        # Call the Google Maps Distance Matrix API
        matrix = gmaps.distance_matrix(user_origin,
                                       shop_destination,
                                       mode="driving",
                                       departure_time="now")

        # Parse the response
        element = matrix['rows'][0]['elements'][0]
        if element['status'] == 'OK':
            distance_text = element['distance']['text'] # e.g., "5.4 km"
            duration_text = element['duration']['text'] # e.g., "15 mins"

            return jsonify({
                "shop_id": shop.id,
                "distance": distance_text,
                "travel_time": duration_text
            })
        else:
            return jsonify({"error": "Could not calculate travel time."}), 400

    except Exception as e:
        app.logger.error(f"Google Maps API error: {e}")
        return jsonify({"error": "Failed to contact distance service."}), 500
# ------------------------------------------------------------------------
@app.route('/api/stats', methods=['GET'])
def get_platform_stats():
    total_users = Shopkeeper.query.count()
    total_shops = Shop.query.count()
    total_queues_managed = Appointment.query.count()

    stats_data = {
        "activeUsers": total_users,
        "serviceProviders": total_shops,
        "queuesManaged": total_queues_managed,
        "customerSatisfaction": 95 # This can remain a static value for now
    }
    return jsonify(stats_data)

@app.route('/api/shops', methods=['GET'])
def get_all_shops():
    all_shops = Shop.query.all()
    return jsonify(shops_schema.dump(all_shops))

@app.route('/api/shops/<int:shop_id>/availability', methods=['GET'])
def get_availability(shop_id):
    shop = Shop.query.get_or_404(shop_id)
    date_str = request.args.get('date')
    if not date_str:
        return jsonify({"error": "A 'date' query parameter is required (YYYY-MM-DD)"}), 400
    try:
        requested_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Please use YYYY-MM-DD."}), 400

    start_of_day = datetime.combine(requested_date, time.min)
    end_of_day = datetime.combine(requested_date, time.max)

    # Get all confirmed appointments and count bookings for each slot
    booked_appointments = Appointment.query.filter(
        Appointment.shop_id == shop_id,
        Appointment.appointment_time.between(start_of_day, end_of_day),
        Appointment.status == 'confirmed'
    ).all()

    booking_counts = {}
    for appt in booked_appointments:
        booking_counts[appt.appointment_time] = booking_counts.get(appt.appointment_time, 0) + 1

    # Get blocked slots
    blocked_slots = BlockedSlot.query.filter(
        BlockedSlot.shop_id == shop_id,
        BlockedSlot.start_time < end_of_day,
        BlockedSlot.end_time > start_of_day
    ).all()

    available_slots = []
    current_time = datetime.combine(requested_date, shop.opening_time)
    end_time_obj = datetime.combine(requested_date, shop.closing_time)

    while current_time < end_time_obj:
        # A slot is available if its booking count is less than the shop's capacity
        is_available = booking_counts.get(current_time, 0) < shop.slot_capacity

        is_blocked = any(
            slot.start_time <= current_time < slot.end_time for slot in blocked_slots
        )

        if is_available and not is_blocked:
            available_slots.append(current_time.isoformat())

        current_time += timedelta(minutes=shop.appointment_duration)

    return jsonify({
        "shop_name": shop.shop_name,
        "slot_capacity": shop.slot_capacity,
        "available_slots": available_slots
    })


@app.route('/api/shops/<int:shop_id>/appointments', methods=['POST'])
@jwt_required() # This is now a protected endpoint
def book_appointment(shop_id):
    shop = Shop.query.get_or_404(shop_id)
    customer_id = get_jwt_identity() # Get the logged-in customer's ID

    data = request.get_json()

    try:
        # We only need the time from the user
        new_appointment = appointment_schema.load(
            {"appointment_time": data.get("appointment_time")},
            partial=True
        )
    except ValidationError as err:
        return jsonify(err.messages), 400

    # --- 1. ONE BOOKING PER DAY VALIDATION ---
    start_of_day = datetime.combine(new_appointment.appointment_time.date(), time.min)
    end_of_day = datetime.combine(new_appointment.appointment_time.date(), time.max)

    existing_booking = Appointment.query.filter(
        Appointment.shop_id == shop_id,
        Appointment.customer_id == customer_id, # Check by customer_id
        Appointment.appointment_time.between(start_of_day, end_of_day)
    ).first()

    if existing_booking:
        return jsonify({"error": "You have already booked an appointment at this shop for this day."}), 409

    # ... (slot capacity check remains the same) ...

    # Generate token
    token = generate_token()

    new_appointment.shop_id = shop_id
    new_appointment.appointment_token = token
    new_appointment.customer_id = customer_id # Assign the customer

    db.session.add(new_appointment)
    db.session.commit()

    # ... (email sending logic remains the same) ...

    return jsonify({
        "message": "Appointment booked successfully!",
        "appointment_token": new_appointment.appointment_token,
        "appointment_details": appointment_schema.dump(new_appointment)
    }), 201

@app.route('/api/appointments/<string:appointment_token>', methods=['GET'])
def get_appointment_status(appointment_token):
    appointment = Appointment.query.filter_by(appointment_token=appointment_token).first_or_404()
    return jsonify(appointment_schema.dump(appointment))

@app.route('/api/appointments/<string:appointment_token>', methods=['PUT'])
def reschedule_customer_appointment(appointment_token):
    appointment = Appointment.query.filter_by(appointment_token=appointment_token).first_or_404()
    data = request.get_json()

    try:
        updated_appointment = appointment_schema.load(data, instance=appointment, partial=True)
    except ValidationError as err:
        return jsonify(err.messages), 400

    new_time = updated_appointment.appointment_time
    current_bookings = Appointment.query.filter(
        Appointment.shop_id == appointment.shop_id,
        Appointment.appointment_time == new_time,
        Appointment.status == 'confirmed',
        Appointment.id != appointment.id
    ).count()

    if current_bookings >= updated_appointment.shop.slot_capacity:
        return jsonify({"error": "This appointment slot is full."}), 409

    updated_appointment.status = 'confirmed'
    db.session.commit()

    # --- EMAIL LOGIC ---
    try:
        msg = Message(
            subject=f"Appointment Rescheduled for {updated_appointment.shop.shop_name}",
            sender=app.config['MAIL_USERNAME'],
            recipients=[updated_appointment.customer_email]
        )
        msg.body = f"""
        Hello {updated_appointment.customer_name},

        Your appointment has been successfully rescheduled!

        New Time: {updated_appointment.appointment_time.strftime('%A, %B %d, %Y at %I:%M %p')}
        Your Token: {updated_appointment.appointment_token}

        Thank you!
        """
        mail.send(msg)
    except Exception as e:
        app.logger.error(f"Failed to send reschedule confirmation email: {e}")
    # --------------------------------

    return jsonify({
        "message": "Appointment rescheduled successfully",
        "appointment": appointment_schema.dump(updated_appointment)
    })

@app.route('/api/appointments/<string:appointment_token>', methods=['DELETE'])
def cancel_customer_appointment(appointment_token):
    appointment = Appointment.query.filter_by(appointment_token=appointment_token).first_or_404()

    appointment.status = 'cancelled'
    db.session.commit()

    # --- EMAIL LOGIC ---
    try:
        msg = Message(
            subject=f"Appointment Cancellation for {appointment.shop.shop_name}",
            sender=app.config['MAIL_USERNAME'],
            recipients=[appointment.customer_email]
        )
        msg.body = f"""
        Hello {appointment.customer_name},

        Your appointment for {appointment.appointment_time.strftime('%A, %B %d, %Y at %I:%M %p')} has been cancelled.

        Thank you.
        """
        mail.send(msg)
    except Exception as e:
        app.logger.error(f"Failed to send cancellation email: {e}")
    # --------------------------------

    return jsonify({"message": "Your appointment has been successfully cancelled."})

# ------------------------------------------------------------------------
# ✅ PROVIDER DASHBOARD ENDPOINTS (for Shopkeepers)
# ------------------------------------------------------------------------

# --- 1️⃣ Provider Dashboard Stats ---
@app.route("/api/provider/stats", methods=["GET"])
@jwt_required()
def get_provider_stats():
    try:
        # ✅ Convert the identity to int to match database FK
        shopkeeper_id = int(get_jwt_identity())

        # ✅ Verify provider exists
        shopkeeper = Shopkeeper.query.get(shopkeeper_id)
        if not shopkeeper:
            return jsonify({"error": "Provider not found"}), 404

        # ✅ Count appointments through shop join
        total_bookings = (
            db.session.query(Appointment)
            .join(Shop, Appointment.shop_id == Shop.id)
            .filter(Shop.shopkeeper_id == shopkeeper_id)
            .count()
        )

        completed = (
            db.session.query(Appointment)
            .join(Shop, Appointment.shop_id == Shop.id)
            .filter(Shop.shopkeeper_id == shopkeeper_id, Appointment.status == "completed")
            .count()
        )

        active = (
            db.session.query(Appointment)
            .join(Shop, Appointment.shop_id == Shop.id)
            .filter(Shop.shopkeeper_id == shopkeeper_id, Appointment.status == "confirmed")
            .count()
        )

        cancelled = (
            db.session.query(Appointment)
            .join(Shop, Appointment.shop_id == Shop.id)
            .filter(Shop.shopkeeper_id == shopkeeper_id, Appointment.status.like("cancelled%"))
            .count()
        )

        # ✅ Add a safe service count (check if Service table exists)
        try:
            services_count = db.session.query(Service).filter_by(shopkeeper_id=shopkeeper_id).count()
        except Exception:
            services_count = 0

        return jsonify({
            "totalBookings": total_bookings,
            "completed": completed,
            "activeQueues": active,
            "cancelled": cancelled,
            "services": services_count
        }), 200

    except Exception as e:
        app.logger.error(f"Provider stats failed: {e}")
        return jsonify({"error": "Failed to fetch provider stats", "details": str(e)}), 500


# --- 2️⃣ Manage Provider Services ---
class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    avg_time = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(255))
    is_active = db.Column(db.Boolean, default=True)
    shopkeeper_id = db.Column(db.Integer, db.ForeignKey('shopkeeper.id'), nullable=False)


class ServiceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Service
        include_fk = True
        load_instance = True


service_schema = ServiceSchema()
services_schema = ServiceSchema(many=True)


# --- Create a new service ---
# ============================
#   SERVICE MANAGEMENT ROUTES
# ============================

@app.route("/api/my-services", methods=["POST"])
@jwt_required()
def create_service():
    """Create a new service for the logged-in shopkeeper"""
    try:
        shopkeeper_id = int(get_jwt_identity())
        shopkeeper = Shopkeeper.query.get(shopkeeper_id)

        if not shopkeeper:
            return jsonify({
                "error": "Unauthorized: Only shopkeepers can create services."
            }), 403

        data = request.get_json() or {}
        name = data.get("name")
        avg_time = data.get("avg_time")
        description = data.get("description", "").strip()

        if not name or not avg_time:
            return jsonify({
                "error": "Both 'name' and 'avg_time' are required fields."
            }), 400

        new_service = Service(
            name=name.strip(),
            avg_time=avg_time.strip(),
            description=description,
            shopkeeper_id=shopkeeper_id
        )

        db.session.add(new_service)
        db.session.commit()

        return jsonify({
            "message": "Service created successfully!",
            "service": service_schema.dump(new_service)
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"/api/my-services (POST) failed: {e}")
        return jsonify({
            "error": "Failed to create service.",
            "details": str(e)
        }), 500


@app.route("/api/my-services", methods=["GET"])
@jwt_required()
def get_services():
    """Retrieve all services belonging to the logged-in shopkeeper"""
    try:
        shopkeeper_id = int(get_jwt_identity())
        shopkeeper = Shopkeeper.query.get(shopkeeper_id)

        if not shopkeeper:
            return jsonify({
                "error": "Unauthorized: Only shopkeepers can access this route."
            }), 403

        services = Service.query.filter_by(shopkeeper_id=shopkeeper_id).all()
        return jsonify(services_schema.dump(services)), 200

    except Exception as e:
        app.logger.error(f"/api/my-services (GET) failed: {e}")
        return jsonify({
            "error": "Failed to fetch services.",
            "details": str(e)
        }), 500


@app.route("/api/my-services/<int:service_id>", methods=["PUT"])
@jwt_required()
def update_service(service_id):
    """Update an existing service for the logged-in shopkeeper"""
    try:
        shopkeeper_id = int(get_jwt_identity())
        service = Service.query.get_or_404(service_id)

        if service.shopkeeper_id != shopkeeper_id:
            return jsonify({"error": "Unauthorized to modify this service."}), 403

        data = request.get_json() or {}

        service.name = data.get("name", service.name).strip()
        service.avg_time = data.get("avg_time", service.avg_time).strip()
        service.description = data.get("description", service.description).strip()
        service.is_active = data.get("is_active", service.is_active)

        db.session.commit()

        return jsonify({
            "message": "Service updated successfully.",
            "service": service_schema.dump(service)
        }), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"/api/my-services/<id> (PUT) failed: {e}")
        return jsonify({
            "error": "Failed to update service.",
            "details": str(e)
        }), 500


@app.route("/api/my-services/<int:service_id>", methods=["DELETE"])
@jwt_required()
def delete_service(service_id):
    """Delete a service belonging to the logged-in shopkeeper"""
    try:
        shopkeeper_id = int(get_jwt_identity())
        service = Service.query.get_or_404(service_id)

        if service.shopkeeper_id != shopkeeper_id:
            return jsonify({"error": "Unauthorized to delete this service."}), 403

        db.session.delete(service)
        db.session.commit()

        return jsonify({"message": "Service deleted successfully."}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"/api/my-services/<id> (DELETE) failed: {e}")
        return jsonify({
            "error": "Failed to delete service.",
            "details": str(e)
        }), 500

# --- 3️⃣ Provider Appointments Summary ---
@app.route('/api/my-appointments', methods=['GET', 'options'])
@jwt_required()
def get_my_appointments():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Try to load customer directly
        customer = Customer.query.filter_by(id=user_id).first()
        if not customer:
            return jsonify({"error": "Customer not found"}), 404

        appointments = (
            Appointment.query
            .filter_by(customer_id=customer.id)
            .order_by(Appointment.appointment_time.desc())
            .all()
        )

        # Clean output safely
        result = []
        for a in appointments:
            result.append({
                "id": a.id,
                "shop_name": a.shop.shop_name if a.shop else "Unknown",
                "appointment_time": a.appointment_time.isoformat(),
                "status": a.status,
                "token": a.appointment_token
            })

        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"/api/my-appointments failed: {e}")
        return jsonify({"error": "Failed to fetch appointments", "details": str(e)}), 500


@app.route('/api/me', methods=['GET'])
@jwt_required()
def get_logged_in_user():
    try:
        # Always keep identity as string for safety
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid or missing token identity"}), 401

        # Try customer first
        customer = Customer.query.filter_by(id=user_id).first()
        if customer:
            return jsonify({
                "role": "customer",
                "id": customer.id,
                "full_name": customer.full_name,
                "email": customer.email,
                "phone": customer.phone,
                "is_verified": customer.is_verified
            }), 200

        # Then try shopkeeper
        shopkeeper = Shopkeeper.query.filter_by(id=user_id).first()
        if shopkeeper:
            return jsonify({
                "role": "shopkeeper",
                "id": shopkeeper.id,
                "full_name": shopkeeper.full_name,
                "email": shopkeeper.email,
                "is_verified": shopkeeper.is_verified
            }), 200

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        app.logger.error(f"/api/me error: {e}")
        return jsonify({"error": "Failed to load profile", "details": str(e)}), 500


@app.route('/api/my-queue', methods=['GET'])
@jwt_required()
def get_my_queue():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Try customer first
        customer = Customer.query.filter_by(id=user_id).first()
        if customer:
            now = datetime.utcnow()
            upcoming = Appointment.query.filter(
                Appointment.customer_id == customer.id,
                Appointment.status.in_(["confirmed", "waiting"]),
                Appointment.appointment_time >= now
            ).order_by(Appointment.appointment_time).all()
            return jsonify({
                "role": "customer",
                "appointments": appointments_schema.dump(upcoming)
            }), 200

        # Then try shopkeeper
        shopkeeper = Shopkeeper.query.filter_by(id=user_id).first()
        if shopkeeper:
            shops = shopkeeper.shops
            if not shops:
                return jsonify({
                    "role": "shopkeeper",
                    "queue": [],
                    "message": "No shops found for this provider"
                }), 200

            # Combine queue for all shops
            all_queues = []
            for shop in shops:
                queue = Appointment.query.filter(
                    Appointment.shop_id == shop.id,
                    Appointment.status.in_(["confirmed", "waiting"])
                ).order_by(Appointment.appointment_time).all()
                all_queues.extend(queue)

            return jsonify({
                "role": "shopkeeper",
                "total_shops": len(shops),
                "queue": appointments_schema.dump(all_queues)
            }), 200

        return jsonify({"error": "User not found"}), 404

    except Exception as e:
        app.logger.error(f"/api/my-queue error: {e}")
        return jsonify({"error": "Failed to fetch queue info", "details": str(e)}), 500

@app.route('/api/shopkeepers', methods=['GET'])
def get_all_shopkeepers():
    """
    Public route: Returns all verified shopkeepers and their shops.
    Used on Queue Booking Page to show available providers.
    """
    try:
        # Only include verified shopkeepers with at least one shop
        shopkeepers = Shopkeeper.query.filter(
            Shopkeeper.is_verified == True
        ).all()

        results = []
        for s in shopkeepers:
            results.append({
                "id": s.id,
                "full_name": s.full_name,
                "email": s.email,
                "phone": getattr(s, "phone", None),
                "businessName": getattr(s, "business_name", None),
                "businessType": getattr(s, "business_type", None),
                "address": getattr(s, "address", None),
                "shops": [
                    {
                        "id": shop.id,
                        "shop_name": shop.shop_name,
                        "address": shop.address,
                        "opening_time": shop.opening_time.strftime("%H:%M") if shop.opening_time else None,
                        "closing_time": shop.closing_time.strftime("%H:%M") if shop.closing_time else None,
                        "slot_capacity": shop.slot_capacity,
                    }
                    for shop in getattr(s, "shops", [])
                ]
            })

        return jsonify(results), 200

    except Exception as e:
        app.logger.error(f"Error in /api/shopkeepers: {e}")
        return jsonify({"error": "Failed to fetch shopkeepers", "details": str(e)}), 500

@app.route('/api/queue/<int:shop_id>', methods=['GET'])
def get_queue_status(shop_id):
    """
    Returns live queue data for a specific shop (not shopkeeper).
    """
    try:
        shop = Shop.query.get(shop_id)
        if not shop:
            return jsonify({"error": "Shop not found"}), 404

        # Count confirmed appointments ahead in queue
        active_appointments = Appointment.query.filter_by(
            shop_id=shop_id, status='confirmed'
        ).order_by(Appointment.appointment_time.asc()).count()

        # Estimate wait time: use shop’s appointment_duration
        estimated_wait_time = (
            f"{active_appointments * shop.appointment_duration} mins"
            if active_appointments > 0
            else "0 mins"
        )

        return jsonify({
            "shop_id": shop_id,
            "shop_name": shop.shop_name,
            "currentQueueSize": active_appointments,
            "estimatedWaitTime": estimated_wait_time,
            "isOpen": True
        }), 200

    except Exception as e:
        app.logger.error(f"/api/queue/<shop_id> error: {e}")
        return jsonify({"error": "Server error fetching queue info", "details": str(e)}), 500


@app.route('/api/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        customer_id = get_jwt_identity()
        data = request.get_json() or {}

        shop_id = data.get("shop_id")
        notification_method = data.get("notification_method", "sms")

        if not shop_id:
            return jsonify({"error": "Shop ID is required"}), 400

        shop = Shop.query.get(shop_id)
        if not shop:
            return jsonify({"error": "Shop not found"}), 404

        # --- Generate booking info ---
        active_count = Appointment.query.filter_by(shop_id=shop_id, status='confirmed').count()
        position = active_count + 1
        token_number = f"T{shop_id:02d}-{position:03d}"

        appointment_time = datetime.combine(
            datetime.today().date(), shop.opening_time
        ) + timedelta(minutes=(position - 1) * shop.appointment_duration)

        # --- Create new appointment ---
        new_appointment = Appointment(
            customer_id=customer_id,
            appointment_time=appointment_time,
            status='confirmed',
            appointment_token=token_number,
            shop_id=shop_id,
        )
        db.session.add(new_appointment)
        db.session.commit()

        # --- Prepare message ---
        customer = Customer.query.get(customer_id)
        message_text = (
            f"Hi {customer.full_name},\n\n"
            f"Your booking at *{shop.shop_name}* is confirmed!\n"
            f"🕒 Appointment Time: {appointment_time.strftime('%I:%M %p')}\n"
            f"🎟️ Token: {token_number}\n"
            f"📍 Position in Queue: {position}\n\n"
            f"Thank you for using QueueMe!"
        )

        # --- Send Notification ---
        if notification_method == "email":
            try:
                msg = Message(
                    subject=f"✅ Booking Confirmed - {shop.shop_name}",
                    sender=app.config["MAIL_USERNAME"],  # ✅ REQUIRED FIELD
                    recipients=[customer.email],
                    body=message_text,
                )
                with app.app_context():
                    mail.send(msg)
                app.logger.info(f"📧 Confirmation email sent to {customer.email}")
            except Exception as mail_err:
                app.logger.error(f"❌ Failed to send email: {mail_err}")

        elif notification_method == "sms":
            try:
                from twilio.rest import Client
                account_sid = os.getenv("TWILIO_ACCOUNT_SID")
                auth_token = os.getenv("TWILIO_AUTH_TOKEN")
                from_number = os.getenv("TWILIO_FROM_NUMBER")

                if not all([account_sid, auth_token, from_number]):
                    raise ValueError("Missing Twilio credentials")

                client = Client(account_sid, auth_token)
                client.messages.create(
                    body=message_text,
                    from_=from_number,
                    to=customer.phone,
                )
                app.logger.info(f"📱 SMS sent to {customer.phone}")
            except Exception as sms_err:
                app.logger.warning(f"⚠️ SMS sending failed: {sms_err}")

        elif notification_method == "app":
            app.logger.info(f"🔔 In-app notification triggered for user {customer_id}")

        # --- Success Response ---
        return jsonify({
            "message": "Booking confirmed successfully!",
            "token": token_number,
            "position": position,
            "shop_id": shop_id,
            "qr_code": f"QUE-ME-{token_number}",
            "notification_sent": notification_method,
        }), 201

    except Exception as e:
        db.session.rollback()
        app.logger.error(f"/api/bookings error: {e}")
        return jsonify({"error": "Failed to create booking", "details": str(e)}), 500


# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)