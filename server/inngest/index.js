import { Inngest } from "inngest";
import User from "../models/User.js";

export const inngest = new Inngest({ id: "movie-ticketing-booking" });

// Inngest Function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: 'sync-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses = [], image_url } = event.data || {};
      const email = (email_addresses[0] && (email_addresses[0].email_address || email_addresses[0].email)) || '';
      const userData = {
        _id: id,
        email,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url || ''
      };
      await User.create(userData);
    } catch (err) {
      console.error('syncUserCreation error:', err?.message || err);
      throw err;
    }
  }
);

// Inngest Function to delete user from database
const syncUserDeletion = inngest.createFunction(
  { id: 'delete-user-with-clerk' },
  { event: 'clerk/user.deleted' },
  async ({ event }) => {
    try {
      const { id } = event.data || {};
      if (!id) return;
      await User.findByIdAndDelete(id);
    } catch (err) {
      console.error('syncUserDeletion error:', err?.message || err);
      throw err;
    }
  }
);

const syncUserUpdation = inngest.createFunction(
  { id: 'update-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses = [], image_url } = event.data || {};
      const email = (email_addresses[0] && (email_addresses[0].email_address || email_addresses[0].email)) || '';
      const userData = {
        _id: id,
        email,
        name: `${first_name || ''} ${last_name || ''}`.trim(),
        image: image_url || ''
      };
      if (!id) return;
      await User.findByIdAndUpdate(id, userData, { upsert: true, new: true });
    } catch (err) {
      console.error('syncUserUpdation error:', err?.message || err);
      throw err;
    }
  }
);

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation
];