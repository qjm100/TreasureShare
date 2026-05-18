package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyOrder;
import java.util.List;

/**
 * 订单Mapper接口
 *
 * @author Ciami
 */
public interface ToyOrderMapper
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
     * 根据订单号查询订单
     */
    ToyOrder selectOrderByOrderNo(String orderNo);

    /**
     * 新增订单
     */
    int insertOrder(ToyOrder order);

    /**
     * 修改订单
     */
    int updateOrder(ToyOrder order);

    /**
     * 查询卖家订单（根据商品所属用户）
     */
    List<ToyOrder> selectSellerOrders(Long userId);

    /**
     * 删除订单
     */
    int deleteOrderById(Long id);
}
