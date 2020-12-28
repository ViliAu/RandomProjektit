package com.example.travelrecorder;

import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;

import android.os.Bundle;
import android.view.View;

import com.example.travelrecorder.databinding.ActivityMainBinding;

import java.util.Objects;

public class MainActivity extends AppCompatActivity {

    private ActivityMainBinding binding;
    private FragmentManager fm;
    private FragmentTransaction ft;
    private Fragment fragment;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(R.layout.activity_main);
        setupToolbar();

        // Initialize view to start fragment
        fm = getSupportFragmentManager();
        if (fm != null) {
            ft = fm.beginTransaction();
            ft.add(R.id.fragment_container, new ProjectSelectFragment());
            ft.commit();
        }
    }

    private void setupToolbar() {
        setSupportActionBar(binding.toolbar);
        Objects.requireNonNull(getSupportActionBar()).setDisplayShowTitleEnabled(false);

        binding.buttonBack.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                //handleBackButtonAction();
            }
        });
    }

    /*
    @Override
    public void onBackPressed() {
        if (fragment instanceof StartFragment)
            super.onBackPressed();
        else
            handleBackButtonAction();
    }

    private void handleBackButtonAction() {
        if (fragment instanceof MainCustomerCreationFragment) {
            loadFragment(new LoginFragment());
        }
        else {
            loadFragment(new StartFragment());
        }
    }*/

    public void loadFragment(Fragment fragment) {
        if (fragment == null)
            return;
        this.fragment = fragment;

        // Hide back button if we're in the first view
        if (fragment instanceof ProjectSelectFragment)
            binding.buttonBack.setVisibility(View.INVISIBLE);
        else
            binding.buttonBack.setVisibility(View.VISIBLE);

        // Load fragment
        fm = getSupportFragmentManager();
        ft = fm.beginTransaction();
        ft.replace(R.id.fragment_container, fragment);
        ft.commit();
    }
}
