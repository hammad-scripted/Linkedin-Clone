import { X } from "lucide-react";
import { useEffect, useState } from "react";

const SkillsSection = ({ userData, isOwnProfile, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [skills, setSkills] = useState(userData.skills || []);
    const [newSkill, setNewSkill] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSkills(userData.skills || []);
        setNewSkill("");
        setIsEditing(false);
    }, [userData._id, userData.skills]);

    const handleAddSkill = () => {
        const skill = newSkill.trim();
        const alreadyExists = skills.some((item) => item.toLowerCase() === skill.toLowerCase());
        if (skill && !alreadyExists) {
            setSkills((current) => [...current, skill]);
            setNewSkill("");
        }
    };

    const handleDeleteSkill = (skill) => {
        setSkills(skills.filter((s) => s !== skill));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({ skills });
            setIsEditing(false);
        } catch {
            // The page mutation reports the error and the editor stays open.
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className='bg-white shadow rounded-lg p-6'>
            <h2 className='text-xl font-semibold mb-4'>Skills</h2>
            <div className='flex flex-wrap'>
                {skills.map((skill) => (
                    <span
                        key={skill}
                        className='bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm mr-2 mb-2 flex items-center'
                    >
                        {skill}
                        {isEditing && (
                            <button onClick={() => handleDeleteSkill(skill)} className='ml-2 text-red-500'>
                                <X size={14} />
                            </button>
                        )}
                    </span>
                ))}
            </div>

            {isEditing && (
                <div className='mt-4 flex'>
                    <input
                        type='text'
                        placeholder='New Skill'
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSkill();
                            }
                        }}
                        className='flex-grow p-2 border rounded-l'
                    />
                    <button
                        type='button'
                        onClick={handleAddSkill}
                        className='bg-primary text-white py-2 px-4 rounded-r hover:bg-primary-dark transition duration-300'
                    >
                        Add Skill
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
                            Edit Skills
                        </button>
                    )}
                </>
            )}
        </div>
    );
};
export default SkillsSection;
