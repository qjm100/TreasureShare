package com.ruoyi.toy.mapper;

import com.ruoyi.toy.domain.ToyAddress;
import java.util.List;

/**
 * 收货地址Mapper接口
 *
 * @author Ciami
 */
public interface ToyAddressMapper
{
    /**
     * 查询用户的收货地址列表
     */
    List<ToyAddress> selectAddressList(Long userId);

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

    /**
     * 清除用户所有默认地址标记
     */
    int clearDefaultByUserId(Long userId);
}
