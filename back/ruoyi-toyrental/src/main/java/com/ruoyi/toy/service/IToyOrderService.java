package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyOrder;
import java.util.List;

/**
 * 订单Service接口
 *
 * @author Ciami
 */
public interface IToyOrderService
{
    /**
     * 查询订单列表
     */
    List<ToyOrder> selectOrderList(ToyOrder order);

    /**
     * 根据ID查询订单
     */
    ToyOrder selectOrderById(Long id);

    /**
     * 创建订单
     */
    Long createOrder(Long addressId);

    /**
     * 支付订单
     */
    int payOrder(Long orderId);

    /**
     * 确认收货
     */
    int confirmReceive(Long orderId);

    /**
     * 查询卖家订单列表
     */
    List<ToyOrder> selectSellerOrderList();

    /**
     * 申请归还
     */
    int applyReturn(Long orderId, String returnLogisticsNo);

    /**
     * 续租
     */
    int renewOrder(Long orderId);

    /**
     * 发货
     */
    int shipOrder(Long orderId, String logisticsNo);

    /**
     * 确认归还
     */
    int confirmReturn(Long orderId);

    /**
     * 消毒完成
     */
    int disinfectComplete(Long orderId);

    /**
     * 取消订单
     */
    int cancelOrder(Long orderId);
}
