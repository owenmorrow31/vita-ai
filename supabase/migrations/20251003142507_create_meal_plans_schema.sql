/*
  # Create Vita AI Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `meal_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `title` (text)
      - `goal` (text)
      - `calories` (integer)
      - `days` (integer)
      - `dietary_restrictions` (text array)
      - `plan_content` (text)
      - `created_at` (timestamptz)
    
    - `saved_meals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `meal_name` (text)
      - `meal_type` (text) - breakfast, lunch, dinner, snack
      - `calories` (integer)
      - `protein` (integer)
      - `carbs` (integer)
      - `fat` (integer)
      - `ingredients` (text array)
      - `instructions` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only read/write their own profiles, meal plans, and saved meals
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  goal text NOT NULL,
  calories integer NOT NULL DEFAULT 2000,
  days integer NOT NULL DEFAULT 1,
  dietary_restrictions text[] DEFAULT '{}',
  plan_content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own meal plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON meal_plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
  ON meal_plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON meal_plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create saved_meals table
CREATE TABLE IF NOT EXISTS saved_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_name text NOT NULL,
  meal_type text NOT NULL,
  calories integer DEFAULT 0,
  protein integer DEFAULT 0,
  carbs integer DEFAULT 0,
  fat integer DEFAULT 0,
  ingredients text[] DEFAULT '{}',
  instructions text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved meals"
  ON saved_meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved meals"
  ON saved_meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved meals"
  ON saved_meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved meals"
  ON saved_meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at ON meal_plans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_meals_user_id ON saved_meals(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_meals_meal_type ON saved_meals(meal_type);