import { useState, type FormEvent, useRef } from "react";
import { Avatar } from "./components/Avatar";
import { type CurrentUser } from "./api/user";
import { updateUser, uploadAvatar } from "./api/user";
import { getApiErrorMessages } from "./api/errors";
import { TEST_ID } from "./constant/testIds";

type SettingsProps = {
  currentUser: CurrentUser;
  onUpdateSuccess: (updatedUser: CurrentUser) => void;
  onCancel: () => void;
};

export default function Settings({ currentUser, onUpdateSuccess, onCancel }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(currentUser.image || "");
  const [username, setUsername] = useState(currentUser.username || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [email, setEmail] = useState(currentUser.email || "");
  const [password, setPassword] = useState("");
  
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessages([]);
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const res = await uploadAvatar(file);
      setImage(res.data.url);
      setSuccessMessage("Image uploaded successfully!");
      setTimeout(() => setSuccessMessage(""), 2000);
    } catch (err) {
      setErrorMessages(getApiErrorMessages(err, "Failed to upload image."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileNameFromUrl = (url: string) => {
    if (!url) return "No image selected";
    try {
      const parts = url.split("/");
      return parts[parts.length - 1];
    } catch {
      return url;
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessages([]);
    setSuccessMessage("");
    setIsSubmitting(true);

    // Validation
    const errors: string[] = [];
    if (username.trim().length < 3 || username.trim().length > 20) {
      errors.push("Username must be between 3 and 20 characters.");
    }
    if (!email.trim()) {
      errors.push("Email is required.");
    }
    if (password) {
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters.");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter.");
      }
      if (!/[0-9]/.test(password)) {
        errors.push("Password must contain at least one number.");
      }
    }

    if (errors.length > 0) {
      setErrorMessages(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: Parameters<typeof updateUser>[0] = {
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim(),
      };
      if (image.trim()) {
        payload.image = image.trim();
      }
      if (password) {
        payload.password = password;
      }

      const res = await updateUser(payload);
      setSuccessMessage("Settings updated successfully!");
      
      // Delay parent state update slightly so the user sees the success state
      setTimeout(() => {
        onUpdateSuccess(res.data);
      }, 800);
    } catch (err) {
      setErrorMessages(getApiErrorMessages(err, "Failed to update settings."));
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="card" data-testid={TEST_ID.SETTINGS.PAGE} style={{ width: "100%", margin: "0 auto", boxShadow: "none", border: "1px solid #e2e8f0", padding: "24px" }}>
      <h2 className="card-title" style={{ fontSize: "20px", marginBottom: "6px" }}>Profile Settings</h2>
      <p className="form-help" style={{ marginBottom: "20px" }}>Update your profile settings and information.</p>

      {/* Session/Dashboard Information */}
      <div className="owner-dashboard-details" data-testid={TEST_ID.DASHBOARD.CARD} style={{ width: "100%", marginBottom: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#475569", marginBottom: "12px" }}>Session Details</h3>
        <div className="detail-row">
          <span className="detail-label">Email</span>
          <span className="detail-value" data-testid={TEST_ID.DASHBOARD.EMAIL}>
            {currentUser.email}
          </span>
        </div>
        <div className="detail-row" style={{ marginTop: "8px", borderBottom: "0" }}>
          <span className="detail-label">Token</span>
          <span className="token-value" data-testid={TEST_ID.DASHBOARD.TOKEN}>
            {currentUser.token}
          </span>
        </div>
      </div>

      <hr className="divider" style={{ margin: "24px 0", border: "0", borderTop: "1px solid #cbd5e1" }} />

      {errorMessages.length > 0 && (
        <div className="form-error" data-testid={TEST_ID.SETTINGS.ERROR}>
          <ul className="error-list">
            {errorMessages.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="status-badge" style={{ display: "block", textAlign: "center", width: "100%", margin: "0 auto 20px" }}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleUpdate}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
          <div 
            className="profile-avatar-wrapper avatar-upload-trigger" 
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            style={{ 
              width: "80px", 
              height: "80px", 
              borderRadius: "50%", 
              overflow: "hidden", 
              background: "#cbd5e1",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              position: "relative"
            }}
            title="Click to upload profile picture"
          >
            <Avatar 
              src={image} 
              alt="Avatar Preview" 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="settings-image">Profile Picture Name</label>
          <input
            id="settings-image"
            data-testid={TEST_ID.SETTINGS.IMAGE_INPUT}
            placeholder="No profile picture uploaded"
            type="text"
            value={getFileNameFromUrl(image)}
            readOnly
            disabled
            style={{ background: "#f1f5f9", cursor: "not-allowed" }}
          />
        </div>

        <div className="form-field">
          <label htmlFor="settings-username">Username</label>
          <input
            id="settings-username"
            data-testid={TEST_ID.SETTINGS.USERNAME_INPUT}
            placeholder="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="settings-bio">Bio</label>
          <textarea
            id="settings-bio"
            data-testid={TEST_ID.SETTINGS.BIO_INPUT}
            placeholder="Short bio about you"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: "100%", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: "8px", resize: "vertical" }}
          />
        </div>

        <div className="form-field">
          <label htmlFor="settings-email">Email</label>
          <input
            id="settings-email"
            data-testid={TEST_ID.SETTINGS.EMAIL_INPUT}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="settings-password">New Password (leave blank to keep current)</label>
          <input
            id="settings-password"
            data-testid={TEST_ID.SETTINGS.PASSWORD_INPUT}
            placeholder="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
          <button
            className="primary-button"
            data-testid={TEST_ID.SETTINGS.SUBMIT_BUTTON}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
          
          <button
            className="secondary-button"
            data-testid={TEST_ID.SETTINGS.CANCEL_BUTTON}
            type="button"
            onClick={onCancel}
            style={{ flexShrink: 0 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
