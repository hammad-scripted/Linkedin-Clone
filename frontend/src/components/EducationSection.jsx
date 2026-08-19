import { School, X } from "lucide-react";
import { useEffect, useState } from "react";

const getYear = (value) => String(value || "").match(/^\d{4}/)?.[0] || "";

const EducationSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [educations, setEducations] = useState(userData.education || []);
    const [isSaving, setIsSaving] = useState(false);
    const [newEducation, setNewEducation] = useState({
        school: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
    });

    useEffect(() => {
        setEducations(userData.education || []);
        setIsEditing(false);
    }, [userData._id, userData.education]);

    const handleAddEducation = () => {
        const school = newEducation.school.trim();
        const fieldOfStudy = newEducation.fieldOfStudy.trim();
        if (school && fieldOfStudy && newEducation.startYear) {
            setEducations((current) => [...current, { ...newEducation, school, fieldOfStudy }]);
            setNewEducation({
                school: "",
                fieldOfStudy: "",
                startYear: "",
                endYear: "",
            });
        }
    };

    const handleDeleteEducation = (indexToDelete) => {
        setEducations((current) => current.filter((_, index) => index !== indexToDelete));
    };

    const handleSave = async () => {
        const education = educations.map((item) => {
            const startYear = getYear(item.startYear);
            const endYear = getYear(item.endYear);
            return {
                ...item,
                startYear: startYear ? `${startYear}-01-01` : null,
                endYear: endYear ? `${endYear}-01-01` : null,
            };
        });

        setIsSaving(true);
        try {
            await onSave({ education });
            setIsEditing(false);
        } catch {
            // The page mutation reports the error and the editor stays open.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='bg-white shadow rounded-lg p-6 mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Education</h2>
            {educations.map((edu, index) => (
                <div key={edu._id || `${edu.school}-${edu.fieldOfStudy}-${edu.startYear}-${index}`} className='mb-4 flex justify-between items-start'>
                    <div className='flex items-start'>
                        <School size={20} className='mr-2 mt-1' />
                        <div>
                            <h3 className='font-semibold'>{edu.fieldOfStudy}</h3>
                            <p className='text-gray-600'>{edu.school}</p>
                            <p className='text-gray-500 text-sm'>
                                {getYear(edu.startYear)} - {getYear(edu.endYear) || "Present"}
                            </p>
                        </div>
                    </div>
                    {isEditing && (
                        <button onClick={() => handleDeleteEducation(index)} className='text-red-500' aria-label='Delete education'>
                            <X size={20} />
                        </button>
                    )}
                </div>
            ))}
            {isEditing && (
                <div className='mt-4'>
                    <input
                        type='text'
                        placeholder='School'
                        value={newEducation.school}
                        onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <input
                        type='text'
                        placeholder='Field of Study'
                        value={newEducation.fieldOfStudy}
                        onChange={(e) => setNewEducation({ ...newEducation, fieldOfStudy: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <input
                        type='number'
                        placeholder='Start Year'
                        value={newEducation.startYear}
                        min='1900'
                        max='2100'
                        onChange={(e) => setNewEducation({ ...newEducation, startYear: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <input
                        type='number'
                        placeholder='End Year'
                        value={newEducation.endYear}
                        min={newEducation.startYear || "1900"}
                        max='2100'
                        onChange={(e) => setNewEducation({ ...newEducation, endYear: e.target.value })}
                        className='w-full p-2 border rounded mb-2'
                    />
                    <button
                        type='button'
                        onClick={handleAddEducation}
                        disabled={!newEducation.school.trim() || !newEducation.fieldOfStudy.trim() || !newEducation.startYear}
                        className='bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition duration-300'
                    >
                        Add Education
                    </button>
                </div>
            )}

            {isOwnProfile && (
                <>
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className='mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark
                             transition duration-300 disabled:opacity-60'
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className='mt-4 text-primary hover:text-primary-dark transition duration-300'
                        >
                            Edit Education
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
export default EducationSection;
