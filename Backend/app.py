import os
import random
import string
from dotenv import load_dotenv
from flask import Flask, jsonify, request, url_for, redirect
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

# --- App Configuration ---
app = Flask(__name__)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///' + os.path.join(basedir, 'app.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', 'on', '1']
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

# --- Initializations ---
cors_origins = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
CORS(app, origins=cors_origins)
jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
ma = Marshmallow(app)
mail = Mail(app) # Initialize Flask-Mail
ts = URLSafeTimedSerializer(app.config["SECRET_KEY"])

# --- Database Models  ---

class Shopkeeper(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    shops = db.relationship('Shop', backref='owner', lazy=True, cascade="all, delete-orphan")

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
    appointments = db.relationship('Appointment', backref='shop', lazy=True, cascade="all, delete-orphan")

class Appointment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100), nullable=False)
    customer_phone = db.Column(db.String(20), nullable=False)
    customer_email = db.Column(db.String(100), nullable=True) # Making it nullable for flexibility
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

class AppointmentSchema(ma.SQLAlchemyAutoSchema):
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

# --- API Endpoints ---
@app.route('/')
def index():
    return "<h1>New Multi-Shop Queue System API</h1>"

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

# --- Public Customer Endpoints ---

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
def book_appointment(shop_id):
    shop = Shop.query.get_or_404(shop_id)
    data = request.get_json()
    
    try:
        new_appointment = appointment_schema.load(data, partial=("status", "appointment_token", "shop_id"))
    except ValidationError as err:
        return jsonify(err.messages), 400

    # --- 1. ONE BOOKING PER DAY VALIDATION ---
    start_of_day = datetime.combine(new_appointment.appointment_time.date(), time.min)
    end_of_day = datetime.combine(new_appointment.appointment_time.date(), time.max)
    
    existing_booking = Appointment.query.filter(
        Appointment.shop_id == shop_id,
        Appointment.customer_email == new_appointment.customer_email,
        Appointment.appointment_time.between(start_of_day, end_of_day)
    ).first()

    if existing_booking:
        return jsonify({"error": "You have already booked an appointment at this shop for this day."}), 409
    # ---------------------------------------------

    # Validation: Check if the slot has reached its capacity
    current_bookings = Appointment.query.filter_by(
        shop_id=shop_id, 
        appointment_time=new_appointment.appointment_time, 
        status='confirmed'
    ).count()

    if current_bookings >= shop.slot_capacity:
        return jsonify({"error": "This appointment slot is full."}), 409

    # Generate a unique token
    while True:
        token = generate_token()
        if not Appointment.query.filter_by(appointment_token=token).first():
            break
            
    new_appointment.shop_id = shop_id
    new_appointment.appointment_token = token
    
    db.session.add(new_appointment)
    db.session.commit()
    
    # --- 2. UPDATED: SEND CONFIRMATION EMAIL VIA FLASK-MAIL ---
    try:
        msg = Message(
            subject=f"Appointment Confirmation for {shop.shop_name}",
            sender=app.config['MAIL_USERNAME'],
            recipients=[new_appointment.customer_email]
        )
        msg.body = f"""
        Hello {new_appointment.customer_name},

        Your appointment has been confirmed!

        Shop: {shop.shop_name}
        Time: {new_appointment.appointment_time.strftime('%A, %B %d, %Y at %I:%M %p')}
        Your Token: {new_appointment.appointment_token}

        Thank you!
        """
        mail.send(msg)
    except Exception as e:
        # Log the error, but don't fail the request if the email fails
        app.logger.error(f"Failed to send customer confirmation email: {e}")
    # ---------------------------------------------------------
    
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

# --- Run the App ---
if __name__ == '__main__':
    app.run(debug=True, port=5000)