import { getSupabase } from '@/lib/supabase';
import type { ProductDownloadLinkRow } from './admin';

export type DownloadLinkMetadata = Pick<ProductDownloadLinkRow, 'id' | 'product_id' | 'title' | 'version' | 'sort_order'>;

export async function listOrderDownloadsAuth(orderId: string): Promise<DownloadLinkMetadata[]> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('external-downloads', {
    body: { action: 'list', orderId }
  });
  
  if (error) {
    console.error('listOrderDownloadsAuth error:', error);
    throw error;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return data?.links || [];
}

export async function listOrderDownloadsGuest(orderNumber: string, accessToken: string): Promise<DownloadLinkMetadata[]> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('external-downloads', {
    body: { action: 'list', orderNumber, accessToken }
  });
  
  if (error) {
    console.error('listOrderDownloadsGuest error:', error);
    throw error;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  
  return data?.links || [];
}

export async function openDownloadLinkAuth(orderId: string, orderItemId: string, linkId: string): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('external-downloads', {
    body: { action: 'open', orderId, orderItemId, linkId }
  });
  
  if (error) {
    console.error('openDownloadLinkAuth error:', error);
    throw error;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  
  if (data?.success && data?.url) {
    return data.url;
  }
  
  throw new Error('Could not open link.');
}

export async function openDownloadLinkGuest(orderNumber: string, accessToken: string, orderItemId: string, linkId: string): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke('external-downloads', {
    body: { action: 'open', orderNumber, accessToken, orderItemId, linkId }
  });
  
  if (error) {
    console.error('openDownloadLinkGuest error:', error);
    throw error;
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  
  if (data?.success && data?.url) {
    return data.url;
  }
  
  throw new Error('Could not open link.');
}
