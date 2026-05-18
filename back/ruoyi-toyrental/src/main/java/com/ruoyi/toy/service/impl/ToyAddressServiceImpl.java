package com.ruoyi.toy.service.impl;

import com.ruoyi.common.utils.SecurityUtils;
import com.ruoyi.toy.domain.ToyAddress;
import com.ruoyi.toy.mapper.ToyAddressMapper;
import com.ruoyi.toy.service.IToyAddressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 收货地址Service业务层处理
 *
 * @author Ciami
 */
@Service
public class ToyAddressServiceImpl implements IToyAddressService
{
    @Autowired
    private ToyAddressMapper addressMapper;

    /**
     * 查询收货地址列表
     */
    @Override
    public List<ToyAddress> selectAddressList()
    {
        return addressMapper.selectAddressList(SecurityUtils.getUserId());
    }

    /**
     * 根据ID查询收货地址
     */
    @Override
    public ToyAddress selectAddressById(Long id)
    {
        return addressMapper.selectAddressById(id);
    }

    /**
     * 新增收货地址
     */
    @Override
    public int insertAddress(ToyAddress address)
    {
        address.setUserId(SecurityUtils.getUserId());
        if ("1".equals(address.getIsDefault()))
        {
            addressMapper.clearDefaultByUserId(SecurityUtils.getUserId());
        }
        return addressMapper.insertAddress(address);
    }

    /**
     * 修改收货地址
     */
    @Override
    public int updateAddress(ToyAddress address)
    {
        if ("1".equals(address.getIsDefault()))
        {
            addressMapper.clearDefaultByUserId(SecurityUtils.getUserId());
        }
        return addressMapper.updateAddress(address);
    }

    /**
     * 删除收货地址
     */
    @Override
    public int deleteAddressById(Long id)
    {
        return addressMapper.deleteAddressById(id);
    }
}
