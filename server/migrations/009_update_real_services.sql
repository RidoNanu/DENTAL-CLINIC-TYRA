-- Update Services with Real Clinic Services
-- This script replaces existing services with professional dental clinic services

-- First, delete all existing services
DELETE FROM services;

-- Insert the real dental services (no price or duration - set to NULL)
INSERT INTO services (name, description, price, duration) VALUES
('Oral Prophylaxis', 'Routine dental cleaning and tartar removal to maintain oral hygiene.', NULL, NULL),
('Root Canal Treatment', 'Treatment for infected or damaged tooth pulp to relieve pain and save the tooth.', NULL, NULL),
('Orthodontics Treatment', 'Correction of teeth alignment and bite issues using braces or aligners.', NULL, NULL),
('Restoration', 'Tooth filling and restoration for decayed or fractured teeth.', NULL, NULL),
('Pedodontic Treatment', 'Specialized dental care and treatment for children.', NULL, NULL),
('Dental Implant', 'Replacement of missing teeth with artificial titanium-based implants.', NULL, NULL),
('Extraction', 'Safe removal of damaged or decayed teeth when restoration is not possible.', NULL, NULL),
('Prosthodontic Treatment', 'Replacement of missing teeth using crowns, bridges, and dentures.', NULL, NULL),
('All Kinds of Dental Treatments', 'Comprehensive dental care and oral health services under one roof.', NULL, NULL),
('Call Us for Enquiry', 'For procedures not listed here, please contact the clinic for more details.', NULL, NULL);

-- Verify the update
SELECT id, name, description FROM services ORDER BY name;

