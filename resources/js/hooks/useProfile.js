import { useState, useEffect, useCallback } from 'react';
import { getProfile, uploadAvatar, changePassword } from '../services/api';

export function useProfile() {
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleAvatarUpload = useCallback(async (file) => {
    const data = await uploadAvatar(file);
    setProfile((prev) => ({ ...prev, avatar_url: data.avatar_url }));
    return data;
  }, []);

  const handleChangePassword = useCallback(async (payload) => {
    return await changePassword(payload);
  }, []);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
    handleAvatarUpload,
    handleChangePassword,
  };
}