import { useEffect, useState } from "react";

const AboutSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [about, setAbout] = useState(userData.about || "");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setAbout(userData.about || "");
        setIsEditing(false);
    }, [userData._id, userData.about]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ about: about.trim() });
            setIsEditing(false);
        } catch {
            // The page mutation reports the error and the editor stays open.
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>About</h2>
            {isEditing ? (
                <>
                    <textarea
                        value={about}
                        onChange={(e) => setAbout(e.target.value)}
                        className='w-full p-2 border rounded'
                        rows='4'
                    />
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className='mt-2 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark
                        transition duration-300 disabled:opacity-60'
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </>
            ) : (
                <>
                    <p className='whitespace-pre-wrap'>{userData.about || "No information provided."}</p>
                    {isOwnProfile && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className='mt-2 text-primary hover:text-primary-dark transition duration-300'
                        >
                            Edit
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
export default AboutSection;
