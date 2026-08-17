import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { toast } from 'react-hot-toast';
import {
  ExternalLink,
  Eye,
  MessageSquare,
  ThumbsUp,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(['authUser']);

  const {
    data: notifications = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/notifications');
      return Array.isArray(data.notifications) ? data.notifications : [];
    },
    enabled: !!authUser,
  });

  const { mutate: markAsReadMutation, isPending: isMarkingAsRead } = useMutation({
    mutationFn: (id) => axiosInstance.put(`/notifications/${id}/read`),
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(['notifications'], (current) =>
        (Array.isArray(current) ? current : []).map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not mark notification as read');
    },
  });

  const { mutate: deleteNotificationMutation, isPending: isDeleting } = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/notifications/${id}`),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData(['notifications'], (current) =>
        (Array.isArray(current) ? current : []).filter(
          (notification) => notification._id !== deletedId,
        ),
      );
      toast.success('Notification deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Could not delete notification');
    },
  });

  const renderNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="text-blue-500" />;

      case 'comment':
        return <MessageSquare className="text-green-500" />;
      case 'connectionAccepted':
        return <UserPlus className="text-purple-500" />;
      default:
        return null;
    }
  };

  const renderNotificationContent = (notification) => {
    const relatedUser = notification.relatedUser;
    const name = relatedUser?.name || 'A user';
    const userName = relatedUser?.username;
    const actor = userName ? (
      <Link to={`/profile/${userName}`} className="font-bold">
        {name}
      </Link>
    ) : (
      <strong>{name}</strong>
    );

    switch (notification.type) {
      case 'like':
        return (
          <span>
            {actor} liked your post
          </span>
        );
      case 'comment':
        return (
          <span>
            {actor} commented on your post
          </span>
        );
      case 'connectionAccepted':
        return (
          <span>
            {actor} accepted your connection request
          </span>
        );
      default:
        return null;
    }
  };

  const renderRelatedPost = (relatedPost) => {
    if (!relatedPost) return null;

    return (
      <Link
        to={`/post/${relatedPost._id}`}
        className="mt-2 p-2 bg-gray-50 rounded-md flex items-center space-x-2 hover:bg-gray-100 transition-colors"
      >
        {relatedPost.image && (
          <img
            src={relatedPost.image}
            alt="Post preview"
            className="w-10 h-10 object-cover rounded"
          />
        )}
        <div className="flex-1 overflow-hidden">
          <p className="text-sm text-gray-600 truncate">
            {relatedPost.content}
          </p>
        </div>
        <ExternalLink size={14} className="text-gray-400" />
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="col-span-1 lg:col-span-1">
        <Sidebar user={authUser} />
      </div>
      <div className="col-span-1 lg:col-span-3">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Notifications</h1>

          {isLoading ? (
            <p>Loading notifications...</p>
          ) : isError ? (
            <div className="text-center">
              <p className="text-red-600 mb-3">Could not load notifications.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="px-4 py-2 rounded-md bg-primary text-white"
              >
                Try again
              </button>
            </div>
          ) : notifications.length > 0 ? (
            <ul>
              {notifications.map((notification) => {
                const relatedUser = notification.relatedUser;
                const avatar = (
                  <img
                    src={relatedUser?.profilePicture || '/avatar.png'}
                    alt={relatedUser?.name || 'User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                );

                return (
                  <li
                    key={notification._id}
                    className={`bg-white border rounded-lg p-4 my-4 transition-all hover:shadow-md ${
                      !notification.read ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {relatedUser?.username ? (
                        <Link to={`/profile/${relatedUser.username}`}>{avatar}</Link>
                      ) : (
                        avatar
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-gray-100 rounded-full">
                            {renderNotificationIcon(notification.type)}
                          </div>
                          <p className="text-sm">
                            {renderNotificationContent(notification)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            {
                              addSuffix: true,
                            },
                          )}
                        </p>
                        {renderRelatedPost(notification.relatedPost)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsReadMutation(notification._id)}
                          disabled={isMarkingAsRead}
                          className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                          aria-label="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotificationMutation(notification._id)
                        }
                        disabled={isDeleting}
                        className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                        aria-label="Delete notification"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No notification at the moment.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default NotificationsPage;
