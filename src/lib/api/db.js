/**
 * Database utility functions for API routes
 */

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export const getSupabaseClient = async () => {
  const cookieStore = await cookies();
  return createClient(cookieStore);
};

/**
 * Products table queries
 */
export const productsDb = {
  async getAll(page = 1, limit = 20, filters = {}) {
    const supabase = await getSupabaseClient();
    let query = supabase.from("products").select("*", { count: "exact" });

    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId);
    }
    if (filters.search) {
      query = query.ilike("product_name", `%${filters.search}%`);
    }

    const from = (page - 1) * limit;
    query = query
      .range(from, from + limit - 1)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;
    return { data, error, total: count };
  },

  async getById(id) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async getByCategory(categoryId, page = 1, limit = 20) {
    return this.getAll(page, limit, { categoryId });
  },

  async getFeatured(limit = 10) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .gt("rating", 4)
      .limit(limit)
      .order("rating", { ascending: false });
    return { data, error };
  },

  async create(productData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();
    return { data, error };
  },

  async update(id, productData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    return { error };
  },
};

/**
 * Categories table queries
 */
export const categoriesDb = {
  async getAll() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    return { data, error };
  },

  async getById(id) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async create(categoryData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .insert([categoryData])
      .select()
      .single();
    return { data, error };
  },

  async update(id, categoryData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("categories")
      .update(categoryData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    return { error };
  },
};

/**
 * Orders table queries
 */
export const ordersDb = {
  async getAll(page = 1, limit = 20, filters = {}) {
    const supabase = await getSupabaseClient();
    let query = supabase.from("orders").select("*", { count: "exact" });

    if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    }

    const from = (page - 1) * limit;
    query = query
      .range(from, from + limit - 1)
      .order("created_at", { ascending: false });

    const { data, error, count } = await query;
    return { data, error, total: count };
  },

  async getById(id) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async create(orderData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select()
      .single();
    return { data, error };
  },

  async update(id, orderData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .update(orderData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async updateDeliveryStatus(id, statusUpdates) {
    const supabase = await getSupabaseClient();
    const updateData = {
      ...statusUpdates,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from("orders")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async getTracking(id) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, order_placed_date, order_confirmed_date, order_shipped_date, out_for_delivery_date, order_delivered_date",
      )
      .eq("id", id)
      .single();
    return { data, error };
  },
};

/**
 * Order Items table queries
 */
export const orderItemsDb = {
  async getByOrderId(orderId) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .select("*, products(product_name, price, image_url, unit)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });
    return { data, error };
  },

  async create(orderItemData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .insert([orderItemData])
      .select()
      .single();
    return { data, error };
  },

  async createBatch(orderItems) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .insert(orderItems)
      .select();
    return { data, error };
  },

  async update(id, itemData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("order_items")
      .update(itemData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("order_items").delete().eq("id", id);
    return { error };
  },

  async deleteByOrderId(orderId) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", orderId);
    return { error };
  },
};

/**
 * Banners table queries
 */
export const bannersDb = {
  async getActive() {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  async getAll(page = 1, limit = 20) {
    const supabase = await getSupabaseClient();
    const from = (page - 1) * limit;
    const { data, error, count } = await supabase
      .from("banners")
      .select("*", { count: "exact" })
      .range(from, from + limit - 1)
      .order("created_at", { ascending: false });
    return { data, error, total: count };
  },

  async getById(id) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async create(bannerData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("banners")
      .insert([bannerData])
      .select()
      .single();
    return { data, error };
  },

  async update(id, bannerData) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
      .from("banners")
      .update(bannerData)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async delete(id) {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("banners").delete().eq("id", id);
    return { error };
  },
};
