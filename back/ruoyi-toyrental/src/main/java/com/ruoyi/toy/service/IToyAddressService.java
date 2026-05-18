package com.ruoyi.toy.service;

import com.ruoyi.toy.domain.ToyAddress;
import java.util.List;

/**
 * 收货地址Service接口
 *
 * @author Ciami
 */
public interface IToyAddressService
{
    /**
     * 查询收货地址列表
     */
    List<ToyAddress> selectAddressList();

    /**
     * 根据ID查询收货地址
     */
    ToyAddress selectAddressById(Long id);

    /**
     * 新增收货地址
     */
    int insertAddress(ToyAddress address);

    /**
     * 修改收货地址
     */
    int updateAddress(ToyAddress address);

    /**
     * 删除收货地址
     */
    int deleteAddressById(Long id);
}
