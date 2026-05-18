package com.ruoyi.toy.domain;

import java.math.BigDecimal;
import java.util.List;
import com.ruoyi.common.core.domain.BaseEntity;

/**
 * 玩具产品对象 toy_product
 *
 * @author Ciami
 */
public class ToyProduct extends BaseEntity
{
    private static final long serialVersionUID = 1L;

    private Long id;

    private Long userId;

    private Long categoryId;

    private String name;

    private String image;

    private BigDecimal price;

    private BigDecimal rentPriceDay;

    private BigDecimal rentPriceMonth;

    private String ageRange;

    private String brand;

    private Integer stock;

    private String status;

    private String description;

    private List<ToyProductImage> images;

    private String categoryName;

    private String nickName;

    private String avatar;

    public Long getId()
    {
        return id;
    }

    public void setId(Long id)
    {
        this.id = id;
    }

    public Long getUserId()
    {
        return userId;
    }

    public void setUserId(Long userId)
    {
        this.userId = userId;
    }

    public Long getCategoryId()
    {
        return categoryId;
    }

    public void setCategoryId(Long categoryId)
    {
        this.categoryId = categoryId;
    }

    public String getName()
    {
        return name;
    }

    public void setName(String name)
    {
        this.name = name;
    }

    public String getImage()
    {
        return image;
    }

    public void setImage(String image)
    {
        this.image = image;
    }

    public BigDecimal getPrice()
    {
        return price;
    }

    public void setPrice(BigDecimal price)
    {
        this.price = price;
    }

    public BigDecimal getRentPriceDay()
    {
        return rentPriceDay;
    }

    public void setRentPriceDay(BigDecimal rentPriceDay)
    {
        this.rentPriceDay = rentPriceDay;
    }

    public BigDecimal getRentPriceMonth()
    {
        return rentPriceMonth;
    }

    public void setRentPriceMonth(BigDecimal rentPriceMonth)
    {
        this.rentPriceMonth = rentPriceMonth;
    }

    public String getAgeRange()
    {
        return ageRange;
    }

    public void setAgeRange(String ageRange)
    {
        this.ageRange = ageRange;
    }

    public String getBrand()
    {
        return brand;
    }

    public void setBrand(String brand)
    {
        this.brand = brand;
    }

    public Integer getStock()
    {
        return stock;
    }

    public void setStock(Integer stock)
    {
        this.stock = stock;
    }

    public String getStatus()
    {
        return status;
    }

    public void setStatus(String status)
    {
        this.status = status;
    }

    public String getDescription()
    {
        return description;
    }

    public void setDescription(String description)
    {
        this.description = description;
    }

    public List<ToyProductImage> getImages()
    {
        return images;
    }

    public void setImages(List<ToyProductImage> images)
    {
        this.images = images;
    }

    public String getCategoryName()
    {
        return categoryName;
    }

    public void setCategoryName(String categoryName)
    {
        this.categoryName = categoryName;
    }

    public String getNickName()
    {
        return nickName;
    }

    public void setNickName(String nickName)
    {
        this.nickName = nickName;
    }

    public String getAvatar()
    {
        return avatar;
    }

    public void setAvatar(String avatar)
    {
        this.avatar = avatar;
    }
}
