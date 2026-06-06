-- 005_seed_special_badges.sql
-- Seed the 5 fixed special badges (one row each, quota=1)

INSERT INTO public.special_badges (name, description, quota)
VALUES
  ('MVP Maintainer', 'Awarded to a maintainer who consistently goes above and beyond in code reviews, mentorship, and community leadership.', 1),
  ('Golden Contributor', 'Awarded to a contributor whose body of work demonstrates exceptional quality, depth, and impact across multiple PRs.', 1),
  ('Community Heart', 'Awarded for outstanding community support, helping others in discussions, issues, and pull requests.', 1),
  ('Innovation Spark', 'Awarded for a novel idea, feature proposal, or technical approach that significantly improves the project.', 1),
  ('Team Catalyst', 'Awarded to someone who elevates team velocity through documentation, tooling, CI/CD improvements, or workflow automation.', 1)
ON CONFLICT (name) DO NOTHING;
