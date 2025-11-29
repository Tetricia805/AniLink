export const USER_ROLES = Object.freeze({
  FARMER: 'farmer',
  VET: 'vet',
  VENDOR: 'vendor',
  ADMIN: 'admin'
});

export const USER_STATUSES = Object.freeze({
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended'
});

export const REGIONS = ['Central', 'Eastern', 'Western', 'Northern'];

export const UGANDA_DISTRICTS = [
  'Kampala',
  'Wakiso',
  'Mukono',
  'Jinja',
  'Gulu',
  'Mbarara',
  'Fort Portal',
  'Arua',
  'Lira',
  'Masaka'
];

export const LIVESTOCK_SPECIES = [
  'cattle',
  'goats',
  'sheep',
  'poultry',
  'swine',
  'rabbits',
  'fish',
  'camels'
];

export const FARM_TYPES = ['smallholder', 'commercial', 'cooperative', 'mixed'];

export const PRACTICE_TYPES = ['mobile', 'clinic', 'telehealth', 'mixed'];

export const CONSULTATION_MODES = ['field', 'clinic', 'virtual'];

export const VET_SPECIALTIES = [
  'dairy',
  'beef',
  'poultry',
  'small ruminants',
  'swine',
  'equine',
  'wildlife',
  'public health'
];

export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

export const APPOINTMENT_STATUS = Object.freeze({
  REQUESTED: 'requested',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
});

export const PAYMENT_STATUS = Object.freeze({
  NOT_REQUIRED: 'not_required',
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed'
});

export const AVAILABILITY_TYPES = Object.freeze({
  RECURRING: 'recurring',
  ONE_TIME: 'one_time',
  BLOCKED: 'blocked'
});

export const HERD_TYPES = ['dairy', 'beef', 'mixed', 'poultry', 'small_ruminants', 'swine', 'other'];

export const LIVESTOCK_PURPOSE = ['breeding', 'milk', 'meat', 'dual-purpose', 'egg', 'traction', 'other'];

export const ANIMAL_STATUS = ['active', 'sold', 'deceased', 'missing'];

export const RECORD_TYPES = [
  'routine_check',
  'vaccination',
  'treatment',
  'lab_result',
  'surgery',
  'mortality',
  'other'
];

export const VACCINE_TYPES = [
  'FMD',
  'CBPP',
  'LSD',
  'Brucellosis',
  'Blackleg',
  'PPR',
  'Newcastle',
  'Gumboro',
  'other'
];

export const PRODUCT_CATEGORIES = [
  'veterinary_drugs',
  'vaccines',
  'feed',
  'supplements',
  'equipment',
  'breeding',
  'services',
  'other'
];

export const UNIT_TYPES = [
  'kg',
  'litre',
  'piece',
  'dose',
  'package'
];

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
});

export const FULFILLMENT_STATUS = Object.freeze({
  NOT_APPLICABLE: 'not_applicable',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed'
});

export const PAYMENT_CHANNELS = ['flutterwave', 'mtn_momo', 'airtel_money', 'manual'];

export const SHIPPING_METHODS = ['pickup', 'courier', 'farmer_arranged'];

export const AI_REQUEST_TYPES = Object.freeze({
  SYMPTOM_CHECK: 'symptom_check',
  FMD_RISK: 'fmd_risk'
});

export const RISK_LEVELS = ['low', 'medium', 'high', 'critical'];

export const NOTIFICATION_TYPES = [
  'appointment_update',
  'order_update',
  'health_alert',
  'payment',
  'system'
];

export const NOTIFICATION_TARGETS = ['farmer', 'vet', 'vendor', 'admin'];

export const MESSAGE_CHANNEL_TYPES = [
  'farmer_vet',
  'farmer_vendor',
  'support'
];

