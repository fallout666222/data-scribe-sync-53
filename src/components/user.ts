
import { supabase } from '../client';
import * as bcrypt from 'bcryptjs';

export const getUsers = async () => {
  try {
    return await supabase.from('users').select(`
      *,
      department:departments(name)
    `).eq('deletion_mark', false);
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error };
  }
};

export const getUserById = async (id: string) => {
  return await supabase.from('users').select(`
    *,
    department:departments(name)
  `).eq('id', id).single();
};

export const createUser = async (user: any) => {
  // Hash the password before storing it
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  return await supabase.from('users').insert(user).select().single();
};

export const updateUser = async (id: string, user: any) => {
  // If password is being updated, hash it
  if (user.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  
  return await supabase.from('users').update(user).eq('id', id).select().single();
};

export const authenticateUser = async (login: string, password: string) => {
  try {
    // Get the user by login
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('login', login)
      .single();
    
    if (userError || !user) {
      console.error('User not found:', userError);
      return { data: null, error: { message: 'Invalid username or password' } };
    }
    
    // Check if the password is already hashed (starts with $2a$ or $2b$ for bcrypt)
    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    
    let isPasswordValid = false;
    
    if (isPasswordHashed) {
      // If password is hashed, use bcrypt to compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For legacy non-hashed passwords, do a direct comparison
      // This allows users with old passwords to still log in
      isPasswordValid = (password === user.password);
      
      // Optionally, update their password to be hashed for next time
      if (isPasswordValid) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the user's password to the hashed version
        await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('id', user.id);
        
        console.log('Updated legacy password to hashed version for user:', user.login);
      }
    }
    
    if (!isPasswordValid) {
      console.error('Invalid password');
      return { data: null, error: { message: 'Invalid username or password' } };
    }
    
    // Password is valid, return the user
    return { data: user, error: null };
  } catch (error) {
    console.error('Authentication error:', error);
    return { data: null, error: { message: 'Authentication failed. Please check your connection to the server.' } };
  }
};

export const getUserSettings = async (userId: string) => {
  return await supabase
    .from('users')
    .select('dark_theme, language')
    .eq('id', userId)
    .single();
};

export const updateUserSettings = async (userId: string, settings: { dark_theme?: boolean, language?: string }) => {
  return await supabase
    .from('users')
    .update(settings)
    .eq('id', userId)
    .select('dark_theme, language')
    .single();
};

export const getUserFirstUnconfirmedWeek = async (userId: string) => {
  // Get week statuses that are either unconfirmed or needs-revision
  const { data: statusNames } = await supabase
    .from('week_status_names')
    .select('id')
    .or('name.eq.unconfirmed,name.eq.needs-revision');
  
  if (!statusNames || statusNames.length === 0) {
    return null;
  }
  
  const statusIds = statusNames.map(status => status.id);
  
  // Find the first week with these statuses
  const { data: weekStatuses, error } = await supabase
    .from('week_statuses')
    .select(`
      id,
      week_id,
      week_status_id,
      user_id,
      week:custom_weeks(id, name, period_from, period_to, required_hours)
    `)
    .eq('user_id', userId)
    .in('week_status_id', statusIds)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching week statuses:', error);
    return null;
  }
  
  if (weekStatuses && weekStatuses.length > 0 && weekStatuses[0].week) {
    return weekStatuses[0].week;
  }
  
  return null;
};
