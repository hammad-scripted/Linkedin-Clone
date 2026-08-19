import { Briefcase, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDate } from "../utils/dateUtils";

const ExperienceSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [experiences, setExperiences] = useState(userData.experience || []);
    const [isSaving, setIsSaving] = useState(false);
    const [newExperience, setNewExperience] = useState({
        title: "",
        company: "",
        startDate: "",
        endDate: "",
        description: "",
        currentlyWorking: false,
    });

    useEffect(() => {
        setExperiences(userData.experience || []);
        setIsEditing(false);
    }, [userData._id, userData.experience]);

    const handleAddExperience = () => {
        const title = newExperience.title.trim();
        const company = newExperience.company.trim();
        if (title && company && newExperience.startDate) {
            setExperiences((current) => [...current, { ...newExperience, title, company }]);

            setNewExperience({
                title: "",
                company: "",
                startDate: "",
                endDate: "",
                description: "",
                currentlyWorking: false,
            });
        }
    };

    const handleDeleteExperience = (indexToDelete) => {
        setExperiences((current) => current.filter((_, index) => index !== indexToDelete));
    };

    const handleSave = async () => {
        const experience = experiences.map(({ currentlyWorking, ...item }) => ({
            ...item,
            endDate: currentlyWorking ? null : item.endDate || null,
        }));

        setIsSaving(true);
        try {
            await onSave({ experience });
            setIsEditing(false);
        } catch {
            // The page mutation reports the error and the editor stays open.
        } finally {
            setIsSaving(false);
        }
    };

    const handleCurrentlyWorkingChange = (e) => {
        setNewExperience({
            ...newExperience,
            currentlyWorking: e.target.checked,
            endDate: e.target.checked ? "" : newExperience.endDate,
        });
    };

    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Experience</h2>
            {experiences.length === 0 && !isEditing && (
                <p className='mb-4 text-gray-500'>No experience added yet.</p>
            )}
            {experiences.map((exp, index) => (
                <div key={exp._id || `${exp.title}-${exp.company}-${exp.startDate}-${index}`} className='mb-4 flex justify-between items-start'>
                    <div className='flex items-start'>
                        <Briefcase size={20} className='mr-2 mt-1' />
                        <div>
                            <h3 className='font-semibold'>{exp.title}</h3>
                            <p className='text-gray-600'>{exp.company}</p>
                            <p className='text-gray-500 text-sm'>
                                {formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : "Present"}
                            </p>
                            <p className='text-gray-700'>{exp.description}</p>
                        </div>
                    </div>
                    {isEditing && (
                        <button onClick={() => handleDeleteExperience(index)} className='text-red-500' aria-label='Delete experience'>
                            <X size={20} />
                        </button>
                    )}
                </div>
            ))}

            {isEditing && (
                <div className='mt-4'>
                    <input
                        type='text'
                        placeholder='Title'
                        value={newExperience.title}
                        onChange={(e) => setNewExperience({ ...newExperience, title: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <input
                        type='text'
                        placeholder='Company'
                        value={newExperience.company}
                        onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <input
                        type='date'
                        placeholder='Start Date'
                        value={newExperience.startDate}
                        onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <div className='flex items-center mb-2'>
                        <input
                            type='checkbox'
                            id='currentlyWorking'
                            checked={newExperience.currentlyWorking}
                            onChange={handleCurrentlyWorkingChange}
                            className='mr-2'
                        />
                        <label htmlFor='currentlyWorking'>I currently work here</label>
                    </div>
                    {!newExperience.currentlyWorking && (
                        <input
                            type='date'
                            placeholder='End Date'
                            value={newExperience.endDate}
                            min={newExperience.startDate}
                            onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                            className='w-full p-2 border rounded mb-2'
                        />
                    )}
                    <textarea
                        placeholder='Description'
                        value={newExperience.description}
                        onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <button
                        type='button'
                        onClick={handleAddExperience}
                        disabled={!newExperience.title.trim() || !newExperience.company.trim() || !newExperience.startDate}
                        className='bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
                    >
                        Add Experience
                    </button>
                </div>
            )}

            {isOwnProfile && (
                <>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className='mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300 disabled:opacity-60'
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className='mt-4 text-primary hover:text-primary-dark transition duration-300'
                        >
                            Edit Experiences
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
export default ExperienceSection;
