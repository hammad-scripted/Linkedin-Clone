import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import Sidebar from '../components/Sidebar';
import Post from '../components/Post';

const PostPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(['authUser']);

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/posts/${id}`);
      return data.post;
    },
    enabled: Boolean(id),
  });

  if (isLoading) return <div>Loading post...</div>;
  if (isError || !post) {
    return (
      <div className="bg-secondary rounded-lg shadow p-6 text-center">
        <p className="mb-4">This post is no longer available.</p>
        <Link to="/" className="text-primary hover:underline">
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <Post post={post} />
      </div>
    </div>
  );
};
export default PostPage;
