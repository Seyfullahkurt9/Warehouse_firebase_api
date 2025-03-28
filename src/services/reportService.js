const { db } = require('../config/firebase');
const { formatDate } = require('../utils/formatters');

/**
 * Report service for generating various system reports
 */
class ReportService {
  /**
   * Generate stock status report
   * @param {Object} filters - Optional filters
   * @return {Object} - Stock status report data
   */
  async generateStockStatusReport(filters = {}) {
    // Get current stock status
    let query = db.collection('stok').where('_system_doc', '!=', true);
    
    // Apply filters if provided
    if (filters.urun_kodu) {
      query = query.where('urun_kodu', '==', filters.urun_kodu);
    }
    
    const stockSnapshot = await query.get();
    
    // Group by product
    const productStocks = {};
    stockSnapshot.forEach(doc => {
      const stockData = doc.data();
      const { urun_kodu, urun_adi, stok_miktari } = stockData;
      
      if (!productStocks[urun_kodu]) {
        productStocks[urun_kodu] = {
          urun_kodu,
          urun_adi,
          total_in: 0,
          total_out: 0,
          current_stock: 0
        };
      }
      
      // Add to appropriate total
      if (stok_miktari > 0) {
        productStocks[urun_kodu].total_in += stok_miktari;
      } else {
        productStocks[urun_kodu].total_out += Math.abs(stok_miktari);
      }
      
      productStocks[urun_kodu].current_stock += stok_miktari;
    });
    
    return {
      generated_at: formatDate(new Date()),
      products: Object.values(productStocks)
    };
  }
  
  /**
   * Generate order status report
   * @param {Object} filters - Optional filters
   * @return {Object} - Order status report data
   */
  async generateOrderStatusReport(filters = {}) {
    let query = db.collection('siparis').where('_system_doc', '!=', true);
    
    // Apply filters
    if (filters.tedarikci_id) {
      query = query.where('tedarikci_tedarikci_id', '==', filters.tedarikci_id);
    }
    
    if (filters.durum) {
      query = query.where('durum', '==', filters.durum);
    }
    
    // Get orders
    const orderSnapshot = await query.get();
    
    // Group by status
    const statusGroups = {
      'beklemede': { count: 0, orders: [] },
      'onaylandı': { count: 0, orders: [] },
      'teslim edildi': { count: 0, orders: [] },
      'iptal': { count: 0, orders: [] }
    };
    
    orderSnapshot.forEach(doc => {
      const orderData = doc.data();
      const status = orderData.durum || 'beklemede';
      
      if (statusGroups[status]) {
        statusGroups[status].count++;
        statusGroups[status].orders.push({
          siparis_id: orderData.siparis_id,
          urun_kodu: orderData.urun_kodu,
          urun_adi: orderData.urun_adi,
          urun_miktari: orderData.urun_miktari,
          siparis_tarihi: orderData.siparis_tarihi
        });
      }
    });
    
    return {
      generated_at: formatDate(new Date()),
      total_orders: orderSnapshot.size,
      by_status: statusGroups
    };
  }
  
  /**
   * Generate supplier performance report
   * @param {Object} filters - Optional filters
   * @return {Object} - Supplier performance report data
   */
  async generateSupplierReport(filters = {}) {
    // Get all suppliers
    const supplierSnapshot = await db.collection('tedarikci')
      .where('_system_doc', '!=', true)
      .get();
    
    const suppliers = {};
    supplierSnapshot.forEach(doc => {
      const supplierData = doc.data();
      suppliers[supplierData.tedarikci_id] = {
        tedarikci_id: supplierData.tedarikci_id,
        tedarikci_ad: supplierData.tedarikci_ad,
        total_orders: 0,
        completed_orders: 0,
        completion_rate: 0,
        total_products: 0
      };
    });
    
    // Get orders by supplier
    const orderSnapshot = await db.collection('siparis')
      .where('_system_doc', '!=', true)
      .get();
    
    orderSnapshot.forEach(doc => {
      const orderData = doc.data();
      const supplierId = orderData.tedarikci_tedarikci_id;
      
      if (suppliers[supplierId]) {
        suppliers[supplierId].total_orders++;
        
        if (orderData.durum === 'teslim edildi') {
          suppliers[supplierId].completed_orders++;
          suppliers[supplierId].total_products += parseFloat(orderData.urun_miktari) || 0;
        }
      }
    });
    
    // Calculate completion rates
    for (const supplierId in suppliers) {
      const supplier = suppliers[supplierId];
      if (supplier.total_orders > 0) {
        supplier.completion_rate = (supplier.completed_orders / supplier.total_orders) * 100;
      }
    }
    
    return {
      generated_at: formatDate(new Date()),
      suppliers: Object.values(suppliers)
    };
  }
}

module.exports = new ReportService();
