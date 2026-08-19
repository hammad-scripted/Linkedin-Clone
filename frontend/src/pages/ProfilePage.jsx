import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const { data: authUser, isLoading } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data.user;
    },
  });
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${username}`);
      return res.data.user;
    },
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(`/users/profile`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['authUser'] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading || isUserProfileLoading) return <div>Loading...</div>;
  const isOwnProfile = authUser.username === userProfile.username;
  const userData = isOwnProfile ? authUser : userProfile;
  const handleSave = (updatedData) => {
    updateProfile(updatedData);
  };

  return;

  <div className="max-w-4xl mx-auto p-4">
    <ProfileHeader
      userData={userData}
      isOwnProfile={isOwnProfile}
      onSave={handleSave}
    />
    <AboutSection
      userData={userData}
      isOwnProfile={isOwnProfile}
      onSave={handleSave}
    />
    <ExperienceSection
      userData={userData}
      isOwnProfile={isOwnProfile}
      onSave={handleSave}
    />
    <EducationSection
      userData={userData}
      isOwnProfile={isOwnProfile}
      onSave={handleSave}
    />
    <SkillsSection
      userData={userData}
      isOwnProfile={isOwnProfile}
      onSave={handleSave}
    />
  </div>;
};

export default ProfilePage;
