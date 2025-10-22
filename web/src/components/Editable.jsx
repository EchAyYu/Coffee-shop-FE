import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Editable({
  children,
  onSave,
  section,
  field,
  as: Component = "div",
}) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(children);

  const handleSave = () => {
    onSave(section, field, content);
    setIsEditing(false);
  };

  if (!isAdmin) {
    return <Component>{children}</Component>;
  }

  if (isEditing) {
    return (
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border rounded-md bg-white"
        />
        <div className="mt-2 flex gap-2">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-500 text-white rounded-md"
          >
            Save
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setContent(children); // Reset content on cancel
            }}
            className="px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      onClick={() => setIsEditing(true)}
      className="relative cursor-pointer hover:outline hover:outline-dashed hover:outline-2 hover:outline-blue-500"
    >
      {children}
    </Component>
  );
}
