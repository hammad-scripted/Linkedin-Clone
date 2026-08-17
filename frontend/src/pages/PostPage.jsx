import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import Post from '../components/Post.jsx';

const PostPage = () => {
  const { id } = useParams();
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/posts/${id}`);
      return data.post;
    },
  });

  if (isLoading) return <p>Loading post...</p>;

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
    <div className="max-w-2xl mx-auto">
      <Post post={post} />
    </div>
  );
};

export default PostPage;
