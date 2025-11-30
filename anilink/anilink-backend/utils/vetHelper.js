import { VetProfile } from '../models/VetProfile.js';

export const getVetProfileForUser = async (userId) =>
  VetProfile.findOne({ user: userId });

