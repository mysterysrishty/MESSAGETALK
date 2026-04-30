import React, { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import Modal from "../common/Modal";
import Button from "../common/Button";
import Input from "../common/Input";
import UserAvatar from "../common/UserAvatar";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile } = useAuth();
  const { fetchUsers, fetchConversations } = useChat();
  const [name, setName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setName(user?.name || "");
    setAvatarPreview(user?.avatar || "");
    setAvatarChanged(false);
  }, [isOpen, user]);

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast.error("Choose a PNG, JPG, WEBP, or GIF image");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 2 MB");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setAvatarPreview(dataUrl);
      setAvatarChanged(true);
    } catch (error) {
      toast.error("Could not load that image");
    } finally {
      event.target.value = "";
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview("");
    setAvatarChanged(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      const payload = { name: trimmedName };
      if (avatarChanged) {
        payload.avatar = avatarPreview || "";
      }

      await updateProfile(payload);
      await Promise.all([fetchUsers(), fetchConversations()]);
      toast.success("Profile updated");
      onClose();
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Profile settings" size="md">
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-[#0f1a20] px-5 py-6">
          <div className="relative">
            <UserAvatar
              user={{ ...user, name, avatar: avatarPreview }}
              size="lg"
              className="ring-4 ring-[#202c33]"
            />
            <button
              type="button"
              onClick={handlePickImage}
              className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#00a884] text-[#0b141a] shadow-lg transition hover:bg-[#06cf9c]"
              title="Choose display picture"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-base font-semibold text-white">
              {name.trim() || user?.name || "Your profile"}
            </p>
            <p className="mt-1 text-sm text-[#8696a0]">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#c7d1d8]">
              Display name
            </label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              icon={<User size={16} />}
              maxLength={40}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#c7d1d8]">
              Display picture
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="rounded-2xl border border-dashed border-[#31444d] bg-[#111b21] p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={handlePickImage}>
                  <ImagePlus className="h-4 w-4" />
                  Choose Photo
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleRemovePhoto}
                  disabled={!avatarPreview}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#8696a0]">
                Supported: PNG, JPG, WEBP, GIF. Maximum size: 2 MB.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProfileModal;
