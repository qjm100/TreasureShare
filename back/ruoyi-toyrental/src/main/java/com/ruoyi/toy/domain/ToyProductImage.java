package com.ruoyi.toy.domain;

import java.io.Serializable;

/**
 * 产品图片对象 toy_product_image
 *
 * @author Ciami
 */
public class ToyProductImage implements Serializable
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long productId;

    private String imageUrl;

    private Integer sort;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getProductId()
    {
        return productId;
    }

    public void setProductId(Long productId)
    {
        this.productId = productId;
    }

    public String getImageUrl()
    {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl)
    {
        this.imageUrl = imageUrl;
    }

    public Integer getSort()
    {
        return sort;
    }

    public void setSort(Integer sort)
    {
        this.sort = sort;
    }
}
