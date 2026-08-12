import React from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
const RecommendedUser = ({ user }) => {
  const { data: connectionStatus, isLoading } = useQuery({
    queryKey: ['connectionStatus', user._id],
    queryFn: async () => {
      const res = await axiosInstance.get(`/connections/status/${user._id}`);
      return res.data.connectionStatus;
    },
  });
  const { mutate: sendConnectionRequest, isLoading } = useMutation({
    mutationFn: async (userId) => {
      await axiosInstance.post(`/connections/request/${userId}`);
    },
    onSuccess: () => {
      toast.success('Connection request sent successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const { mutate: acceptConnectionRequest, isLoading } = useMutation({
    mutateFn: async (requestId) => {
      await axiosInstance.put(`/connections/accept/${requestId}`);
    },
    onSuccess: () => {
      toast.success('Connection accepted successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });

  const { mutate: rejectConnectionRequest, isLoading } = useMutation({
    mutateFn: async (requestId) => {
      await axiosInstance.put(`/connections/reject/${requestId}`);
    },
    onSuccess: () => {
      toast.success('Connection rejected successfully');
    },
    onError: (error) => {
      toast.error(error.response.data.message || 'Something went wrong');
    },
  });
  return <div>RecommendedUser</div>;
};

export default RecommendedUser;
