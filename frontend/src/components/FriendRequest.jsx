import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const FriendRequest = ({ request }) => {
	const queryClient = useQueryClient();
	const getErrorMessage = (error) =>
		error.response?.data?.message || "Something went wrong";
	const refreshConnectionData = () => {
		queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		queryClient.invalidateQueries({ queryKey: ["connections"] });
		queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
		queryClient.invalidateQueries({ queryKey: ["authUser"] });
	};

	const { mutate: acceptConnectionRequest, isPending: isAccepting } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request accepted");
			refreshConnectionData();
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});

	const { mutate: rejectConnectionRequest, isPending: isRejecting } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request rejected");
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		},
		onError: (error) => {
			toast.error(getErrorMessage(error));
		},
	});
	const isUpdating = isAccepting || isRejecting;

	return (
		<div className='bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md'>
			<div className='flex items-center gap-4'>
				<Link to={`/profile/${request.sender.username}`}>
					<img
						src={request.sender.profilePicture || "/avatar.png"}
						alt={request.sender.name}
						className='w-16 h-16 rounded-full object-cover'
					/>
				</Link>

				<div>
					<Link to={`/profile/${request.sender.username}`} className='font-semibold text-lg'>
						{request.sender.name}
					</Link>
					<p className='text-gray-600'>{request.sender.headline}</p>
				</div>
			</div>

			<div className='flex gap-2 self-end sm:self-auto'>
				<button
					className='bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors'
					onClick={() => acceptConnectionRequest(request._id)}
					disabled={isUpdating}
				>
					{isAccepting ? "Accepting..." : "Accept"}
				</button>
				<button
					className='bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors'
					onClick={() => rejectConnectionRequest(request._id)}
					disabled={isUpdating}
				>
					{isRejecting ? "Rejecting..." : "Reject"}
				</button>
			</div>
		</div>
	);
};
export default FriendRequest;
