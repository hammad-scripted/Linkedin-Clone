import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import ProfileHeader from '../components/ProfileHeader';
import SkillsSection from '../components/SkillsSection';
import ExperienceSection from '../components/ExperienceSection';
import EducationSection from '../components/EducationSection';
import AboutSection from '../components/AboutSection';
const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const {
    data: authUser,
    isLoading: isAuthUserLoading,
    error: authUserError,
  } = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      const res = await axiosInstance.get('/auth/me');
      return res.data.user;
    },
  });
  const {
    data: userProfile,
    isLoading: isUserProfileLoading,
    error: userProfileError,
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${username}`);
      return res.data.user;
    },
    enabled: Boolean(username),
  });

  const { mutateAsync: updateProfile } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.put(`/users/profile`, data);
      return res.data.user;
    },
    onSuccess: (updatedUser) => {
      toast.success('Profile updated successfully');
      queryClient.setQueryData(['authUser'], updatedUser);
      queryClient.setQueryData(['userProfile', username], updatedUser);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Unable to update profile');
    },
  });

  if (isAuthUserLoading || isUserProfileLoading) return <div>Loading...</div>;

  const queryError = authUserError || userProfileError;
  if (queryError || !authUser || !userProfile) {
    return (
      <div className="p-4 text-center text-red-600">
        {queryError?.response?.data?.message || 'Unable to load this profile'}
      </div>
    );
  }

  const isOwnProfile = authUser._id === userProfile._id;
  const userData = isOwnProfile ? authUser : userProfile;
  const handleSave = (updatedData) => updateProfile(updatedData);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={userData}
        authUser={authUser}
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
    </div>
  );
};

export default ProfilePage;
