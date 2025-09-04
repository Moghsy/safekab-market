package com.safekab.market.entity;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true)
    private String mobileNumber;

    @ManyToMany(fetch = FetchType.LAZY) // fetch roles only when needed
    @JoinTable(name = "user_roles", // join table
            joinColumns = @JoinColumn(name = "user_id"), // FK to users
            inverseJoinColumns = @JoinColumn(name = "role_id") // FK to roles
    )
    private Set<Role> roles = new HashSet<>();

    // @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    // @JsonIgnore
    // private Cart cart;

    // compatibility helper returning role names used by token builder
    public List<RoleName> getRoleNames() {
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }
        return roles.stream().map(Role::getName).collect(Collectors.toList());
    }

    public List<String> getRoleNamesAsString() {
        return roles.stream().map((role) -> String.valueOf(role.getName()))
                .collect(Collectors.toList());
    }
}
