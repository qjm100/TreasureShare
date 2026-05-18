package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyOrderItem;
import java.util.List;

/**
 * 订单项Mapper接口
 *
 * @author Ciami
 */
public interface ToyOrderItemMapper
{
    /**
     * 根据订单ID查询订单项列表
     */
    List<ToyOrderItem> selectItemsByOrderId(Long orderId);

    /**
     * 新增订单项
     */
    int insertOrderItem(ToyOrderItem orderItem);
}
