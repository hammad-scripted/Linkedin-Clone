import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

import { Camera, Clock, MapPin, UserCheck, UserPlus, X } from "lucide-react";

const ProfileHeader = ({ userData, authUser, onSave, isOwnProfile }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const queryClient = useQueryClient();

    useEffect(() => {
        setIsEditing(false);
        setEditedData({});
    }, [userData._id]);

    const { data: connectionStatus, isLoading: isConnectionStatusLoading } = useQuery({
        queryKey: ["connectionStatus", userData._id],
        queryFn: async () => {
            const response = await axiosInstance.get(`/connections/status/${userData._id}`);
            return response.data.connectionStatus;
        },
        enabled: !isOwnProfile,
    });

    const isConnected = (userData.connections || []).some((connection) => {
        const connectionId = typeof connection === "object" ? connection._id : connection;
        return String(connectionId) === String(authUser?._id);
    });

    const refreshConnectionData = () => {
        queryClient.invalidateQueries({ queryKey: ["connectionStatus", userData._id] });
        queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
        queryClient.invalidateQueries({ queryKey: ["userProfile", userData.username] });
    };

    const { mutate: sendConnectionRequest } = useMutation({
        mutationFn: (userId) => axiosInstance.post(`/connections/request/${userId}`),
        onSuccess: () => {
            toast.success("Connection request sent");
            refreshConnectionData();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: acceptRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request accepted");
            refreshConnectionData();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: rejectRequest } = useMutation({
        mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
        onSuccess: () => {
            toast.success("Connection request rejected");
            refreshConnectionData();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const { mutate: removeConnection } = useMutation({
        mutationFn: (userId) => axiosInstance.delete(`/connections/${userId}`),
        onSuccess: () => {
            toast.success("Connection removed");
            refreshConnectionData();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || "An error occurred");
        },
    });

    const getConnectionStatus = useMemo(() => {
        if (isConnected) return "connected";
        if (connectionStatus?.status === "accepted") return "connected";
        if (connectionStatus?.status === "pending") {
            return connectionStatus.direction === "received" ? "received" : "pending";
        }
        return "not_connected";
    }, [isConnected, connectionStatus]);

    const renderConnectionButton = () => {
        const baseClass = "text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center";
        switch (getConnectionStatus) {
            case "connected":
                return (
                    <div className='flex gap-2 justify-center'>
                        <div className={`${baseClass} bg-green-500 hover:bg-green-600`}>
                            <UserCheck size={20} className='mr-2' />
                            Connected
                        </div>
                        <button
                            className={`${baseClass} bg-red-500 hover:bg-red-600 text-sm`}
                            onClick={() => removeConnection(userData._id)}
                        >
                            <X size={20} className='mr-2' />
                            Remove Connection
                        </button>
                    </div>
                );

            case "pending":
                return (
                    <button disabled className={`${baseClass} bg-yellow-500 cursor-not-allowed`}>
                        <Clock size={20} className='mr-2' />
                        Pending
                    </button>
                );

            case "received":
                return (
                    <div className='flex gap-2 justify-center'>
                        <button
                            onClick={() => acceptRequest(connectionStatus.requestId)}
                            className={`${baseClass} bg-green-500 hover:bg-green-600`}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => rejectRequest(connectionStatus.requestId)}
                            className={`${baseClass} bg-red-500 hover:bg-red-600`}
                        >
                            Reject
                        </button>
                    </div>
                );
            default:
                return (
                    <button
                        onClick={() => sendConnectionRequest(userData._id)}
                        className='bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-full transition duration-300 flex items-center justify-center'
                    >
                        <UserPlus size={20} className='mr-2' />
                        Connect
                    </button>
                );
        }
    };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const fieldName = event.target.name;
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditedData((prev) => ({ ...prev, [fieldName]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (editedData.name !== undefined && !editedData.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(editedData);
            setEditedData({});
            setIsEditing(false);
        } catch {
            // The page mutation displays the API error and keeps the editor open.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='bg-white shadow rounded-lg mb-6'>
            <div
                className='relative h-48 rounded-t-lg bg-cover bg-center'
                style={{
                    backgroundImage: `url('${editedData.bannerImg || userData.bannerImg || "/banner.png"}')`,
                }}
            >
                {isEditing && (
                    <label className='absolute top-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer'>
                        <Camera size={20} />
                        <input
                            type='file'
                            className='hidden'
                            name='bannerImg'
                            onChange={handleImageChange}
                            accept='image/*'
                        />
                    </label>
                )}
            </div>

            <div className='p-4'>
                <div className='relative -mt-20 mb-4'>
                    <img
                        className='w-32 h-32 rounded-full mx-auto object-cover'
                        src={editedData.profilePicture || userData.profilePicture || "/avatar.png"}
                        alt={userData.name}
                    />

                    {isEditing && (
                        <label className='absolute bottom-0 right-1/2 transform translate-x-16 bg-white p-2 rounded-full shadow cursor-pointer'>
                            <Camera size={20} />
                            <input
                                type='file'
                                className='hidden'
                                name='profilePicture'
                                onChange={handleImageChange}
                                accept='image/*'
                            />
                        </label>
                    )}
                </div>

                <div className='text-center mb-4'>
                    {isEditing ? (
                        <input
                            type='text'
                            value={editedData.name ?? userData.name}
                            onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                            className='text-2xl font-bold mb-2 text-center w-full'
                        />
                    ) : (
                        <h1 className='text-2xl font-bold mb-2'>{userData.name}</h1>
                    )}

                    {isEditing ? (
                        <input
                            type='text'
                            value={editedData.headline ?? userData.headline}
                            onChange={(e) => setEditedData({ ...editedData, headline: e.target.value })}
                            className='text-gray-600 text-center w-full'
                        />
                    ) : (
                        <p className='text-gray-600'>{userData.headline}</p>
                    )}

                    <div className='flex justify-center items-center mt-2'>
                        <MapPin size={16} className='text-gray-500 mr-1' />
                        {isEditing ? (
                            <input
                                type='text'
                                value={editedData.location ?? userData.location}
                                onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                                className='text-gray-600 text-center'
                            />
                        ) : (
                            <span className='text-gray-600'>{userData.location}</span>
                        )}
                    </div>
                </div>

                {isOwnProfile ? (
                    isEditing ? (
                        <button
                            className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark
                             transition duration-300 disabled:opacity-60'
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Saving..." : "Save Profile"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className='w-full bg-primary text-white py-2 px-4 rounded-full hover:bg-primary-dark
                             transition duration-300'
                        >
                            Edit Profile
                        </button>
                    )
                ) : (
                    <div className='flex justify-center'>
                        {isConnectionStatusLoading ? <span>Loading connection...</span> : renderConnectionButton()}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ProfileHeader;
